import { createProtobufRpcClient, createPromiseClient } from "@bufbuild/connect";
import { NextFetchHandler } from "@bufbuild/connect-nextjs";
import { ElizaService } from "./test/basic/gen/connectweb/eliza_connect";
import { ElizaServiceClient } from "./test/basic/gen/connectweb/eliza_client";
import { IntroduceRequest } from "./test/basic/gen/eliza_pb";

const rpc = createProtobufRpcClient({
  transport: new NextFetchHandler(),
});

const client: ElizaServiceClient = createPromiseClient(ElizaService, rpc);

export default async function Page() {
  const result = await client.introduce(new IntroduceRequest({ name: "Test" }));
  return <div>{result.sentence}</div>;
}
