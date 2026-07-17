import os
import sys
import json
import argparse
import time
import warnings
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Ignore warning logs for cleaner output
warnings.filterwarnings("ignore")

def adf_test(series):
    """Perform Augmented Dickey-Fuller test for stationarity."""
    try:
        result = adfuller(series.dropna())
        return {
            "adf_statistic": float(result[0]),
            "p_value": float(result[1]),
            "is_stationary": bool(result[1] < 0.05)
        }
    except Exception as e:
        return {
            "adf_statistic": 0.0,
            "p_value": 1.0,
            "is_stationary": False,
            "error": str(e)
        }

def grid_search_sarima(series, s=12):
    """Grid search to select best SARIMA parameters based on AIC."""
    # List of parameters to test (keep grid size small for fast execution)
    p_params = [0, 1]
    d_params = [1]
    q_params = [0, 1]
    P_params = [0, 1]
    D_params = [0]
    Q_params = [0, 1]
    
    best_aic = float("inf")
    best_order = (1, 1, 0)
    best_seasonal_order = (0, 0, 0, s)
    best_model = None

    # Fallback to ARIMA if series length is too short for seasonal model
    if len(series) < s * 2:
        s = 0
        best_seasonal_order = (0, 0, 0, 0)

    for p in p_params:
        for d in d_params:
            for q in q_params:
                order = (p, d, q)
                if s > 0:
                    for P in P_params:
                        for D in D_params:
                            for Q in Q_params:
                                seasonal_order = (P, D, Q, s)
                                try:
                                    model = SARIMAX(
                                        series,
                                        order=order,
                                        seasonal_order=seasonal_order,
                                        enforce_stationarity=False,
                                        enforce_invertibility=False
                                    )
                                    results = model.fit(disp=False)
                                    if results.aic < best_aic:
                                        best_aic = results.aic
                                        best_order = order
                                        best_seasonal_order = seasonal_order
                                        best_model = results
                                except:
                                    continue
                else:
                    try:
                        model = SARIMAX(
                            series,
                            order=order,
                            enforce_stationarity=False,
                            enforce_invertibility=False
                        )
                        results = model.fit(disp=False)
                        if results.aic < best_aic:
                            best_aic = results.aic
                            best_order = order
                            best_model = results
                    except:
                        continue
                        
    if best_model is None:
        # Final emergency fallback if model fitting failed
        try:
            model = SARIMAX(series, order=(1, 1, 0))
            best_model = model.fit(disp=False)
        except Exception as e:
            raise RuntimeError(f"Could not fit any model: {str(e)}")

    return best_order, best_seasonal_order, best_model

def calculate_metrics(y_true, y_pred):
    """Calculate error metrics: MAE, RMSE, MAPE."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    # Filter out zeros to avoid division-by-zero errors in MAPE
    mask = y_true != 0
    if np.sum(mask) == 0:
        mape = 0.0
    else:
        mape = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)
        
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    
    return mae, rmse, mape

def main():
    parser = argparse.ArgumentParser(description="AgriFarm SARIMA Demand Forecasting Service")
    parser.add_argument("--data_path", required=True, help="Path to monthly aggregated CSV dataset")
    args = parser.parse_args()

    start_time = time.time()
    logs = []
    
    def log(msg):
        logs.append(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

    log("SARIMA Service Started.")
    
    if not os.path.exists(args.data_path):
        print(json.dumps({"status": "FAILED", "error": f"Data file not found: {args.data_path}"}))
        return

    try:
        df = pd.read_csv(args.data_path)
        log(f"Dataset loaded successfully. Total records: {len(df)}")
        
        # Ensure correct date indexing
        df["Month"] = pd.to_datetime(df["Month"])
        products = df["Product"].unique()
        log(f"Unique products found: {list(products)}")
        
        results = []
        recommendations = []
        
        for product in products:
            log(f"Processing product: {product}")
            prod_df = df[df["Product"] == product].sort_values("Month")
            
            # Fill missing months in the timeline
            prod_df.set_index("Month", inplace=True)
            series = prod_df["Quantity"].resample("MS").sum().fillna(0.0)
            log(f"Product '{product}' timeline covers {len(series)} months (resampled).")
            
            if len(series) < 6:
                log(f"Warning: Dataset too short ({len(series)} records) for product '{product}'. Minimum 6 required.")
                continue
                
            # Split dataset into training/testing (80/20 split or last 6 months for testing)
            test_size = max(3, int(len(series) * 0.2))
            train_series = series.iloc[:-test_size]
            test_series = series.iloc[-test_size:]
            
            log(f"Data Split: {len(train_series)} training, {len(test_series)} validation records.")
            
            # Stationarity (ADF check)
            adf_res = adf_test(train_series)
            log(f"ADF test results for {product}: Stat={adf_res['adf_statistic']:.3f}, p={adf_res['p_value']:.4f}, stationary={adf_res['is_stationary']}")
            
            # Model selection (AIC grid search)
            order, seasonal_order, fitted_model = grid_search_sarima(train_series, s=12)
            model_name = f"SARIMA({order[0]},{order[1]},{order[2]})"
            if len(seasonal_order) == 4 and seasonal_order[3] > 0:
                model_name += f"({seasonal_order[0]},{seasonal_order[1]},{seasonal_order[2]}){seasonal_order[3]}"
            log(f"Best model selected for {product}: {model_name}")
            
            # Validate predictions on test split
            pred_validation = fitted_model.predict(start=len(train_series), end=len(series)-1)
            # Ensure predictions are non-negative
            pred_validation = np.clip(pred_validation, 0, None)
            
            mae, rmse, mape = calculate_metrics(test_series, pred_validation)
            log(f"Accuracy metrics for {product}: MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.2f}%")
            
            # Retrain model on complete series for final forecast
            final_model = SARIMAX(
                series,
                order=order,
                seasonal_order=seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False
            ).fit(disp=False)
            
            # Forecast next 3 months
            forecast_steps = 3
            forecast_res = final_model.get_forecast(steps=forecast_steps)
            forecast_mean = np.clip(forecast_res.predicted_mean, 0, None)
            
            # Get confidence intervals (95%)
            conf_int = forecast_res.conf_int(alpha=0.05)
            
            last_date = series.index[-1]
            forecast_dates = [last_date + pd.DateOffset(months=i) for i in range(1, forecast_steps + 1)]
            
            forecast_3months = []
            for i in range(forecast_steps):
                fd = forecast_dates[i].strftime("%Y-%m")
                val = float(forecast_mean.iloc[i])
                low = float(np.clip(conf_int.iloc[i, 0], 0, None))
                high = float(np.clip(conf_int.iloc[i, 1], 0, None))
                forecast_3months.append({
                    "month": fd,
                    "value": round(val, 2),
                    "lower": round(low, 2),
                    "upper": round(high, 2)
                })
                
            forecast_next_month = forecast_3months[0]["value"]
            confidence = float(100.0 - min(99.0, mape)) # Confidence proxy based on accuracy
            
            # Identify trend direction
            current_value = float(series.iloc[-1])
            diff_percent = ((forecast_next_month - current_value) / current_value) * 100.0 if current_value > 0 else 0.0
            if diff_percent > 10.0:
                trend = "INCREASING"
            elif diff_percent < -10.0:
                trend = "DECREASING"
            else:
                trend = "STABLE"
                
            # Status mapping
            if mape < 15.0:
                status = "GOOD"
            elif mape < 30.0:
                status = "WARNING"
            else:
                status = "NEEDS_RETRAINING"
                
            # Generate recommendations
            if trend == "INCREASING":
                if product.lower() == "lettuce":
                    rec_text = "Increase Lettuce inventory next month."
                elif product.lower() == "pechay":
                    rec_text = "Prepare additional Pechay harvest."
                else:
                    rec_text = f"Increase {product} inventory next month."
            elif trend == "DECREASING":
                rec_text = f"Demand for {product} is decreasing."
            else:
                if product.lower() == "kangkong":
                    rec_text = "Harvest planning recommended."
                else:
                    rec_text = f"Demand for {product} remains stable."
                    
            recommendations.append({
                "product": product,
                "recommendation": rec_text
            })
            
            # Format history for graphing
            hist_list = [{"month": index.strftime("%Y-%m"), "value": float(val)} for index, val in series.items()]
            
            results.append({
                "product": product,
                "historicalMonthlyDemand": hist_list,
                "forecastNextMonth": round(forecast_next_month, 2),
                "forecastNext3Months": forecast_3months,
                "trend": trend,
                "confidence": round(confidence, 2),
                "mape": round(mape, 2),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "status": status,
                "modelUsed": model_name,
                "trainingDatasetSize": len(train_series),
                "testingDatasetSize": len(test_series)
            })
            
        duration = int((time.time() - start_time) * 1000)
        log("SARIMA Service Finished Successfully.")
        
        # Calculate summary MAPE
        avg_mape = float(np.mean([r["mape"] for r in results])) if results else 0.0
        
        output = {
            "status": "SUCCESS",
            "productsForecasted": len(results),
            "sarimaModel": "SARIMA",
            "mape": round(avg_mape, 2),
            "duration": duration,
            "results": results,
            "recommendations": recommendations,
            "logs": "\n".join(logs)
        }
        print(json.dumps(output))
        
    except Exception as e:
        log(f"Error during forecasting: {str(e)}")
        print(json.dumps({
            "status": "FAILED",
            "error": str(e),
            "logs": "\n".join(logs)
        }))

if __name__ == "__main__":
    main()
