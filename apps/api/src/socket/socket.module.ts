import { Global, Module } from "@nestjs/common";
import { AppGateway } from "./socket.gateway";

@Global()
@Module({ providers: [AppGateway], exports: [AppGateway] })
export class SocketModule {}
