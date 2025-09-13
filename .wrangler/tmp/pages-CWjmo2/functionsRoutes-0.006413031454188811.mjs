import { onRequest as __api_database_ts_onRequest } from "D:\\HandyWriterz\\functions\\api\\database.ts"
import { onRequest as __api_r2_ts_onRequest } from "D:\\HandyWriterz\\functions\\api\\r2.ts"
import { onRequest as __api_submissions_ts_onRequest } from "D:\\HandyWriterz\\functions\\api\\submissions.ts"
import { onRequest as __api_test_ts_onRequest } from "D:\\HandyWriterz\\functions\\api\\test.ts"
import { onRequest as __api_upload_ts_onRequest } from "D:\\HandyWriterz\\functions\\api\\upload.ts"

export const routes = [
    {
      routePath: "/api/database",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_database_ts_onRequest],
    },
  {
      routePath: "/api/r2",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_r2_ts_onRequest],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_submissions_ts_onRequest],
    },
  {
      routePath: "/api/test",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_test_ts_onRequest],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_upload_ts_onRequest],
    },
  ]