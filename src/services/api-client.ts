import axios from "axios";

import { attachAuthInterceptors } from "@/services/interceptors/auth-interceptor";
import { attachResponseInterceptor } from "@/services/interceptors/response-interceptor";
import { httpClientConfig } from "@/services/http-config";

export const apiClient = axios.create(httpClientConfig);

attachAuthInterceptors(apiClient);
attachResponseInterceptor(apiClient);
