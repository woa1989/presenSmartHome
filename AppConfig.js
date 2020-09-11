import AppConfigDev from "./app_config.dev"

const AppConfig = {
  api: '',
  api_key: '',
  api_secret: '',
  gcs_grpc: '',
  sn: '',
  sn_id: '',
  scopes: '',
  is_connect_prd: false,
};
if (__DEV__) {
  Object.assign(AppConfig, AppConfigDev)
}

module.exports = AppConfig;
