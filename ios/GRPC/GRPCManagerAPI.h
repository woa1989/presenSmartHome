//
//  GRPCService.h
//  presensmarthome
//
//  Created by shitou on 2018/11/11.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <PresenGRPC/Gcsproto.pbobjc.h>
#import <PresenGRPC/Gcsproto.pbrpc.h>
#import <React/RCTBridgeModule.h>
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXBufferedPipe.h>
#import <RxLibrary/GRXWriter.h>

NS_ASSUME_NONNULL_BEGIN

@interface GRPCManagerAPI : NSObject {
  GRPCService *service;
  GRPCStreamingProtoCall *biConnection;
}

@property (nonatomic, readwrite) NSString *env;
@property (nonatomic, readwrite) NSString *host;

- (id)initWithConfig:(NSDictionary *)args;

//- (void)helloWorld:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback;
- (void)helloWorld:(NSDictionary *)args
          delegate:(id<GRPCProtoResponseHandler>)delegate;
- (void)connect:(NSDictionary *)args
       delegate:(id<GRPCProtoResponseHandler>)delegate
       callback:(void (^)(GRPCMsgSimpleRsp *reply, NSError *_Nullable error))callback;

- (void)send:(NSDictionary *)args; // 发送一个消息
- (void)close;

@end

NS_ASSUME_NONNULL_END
