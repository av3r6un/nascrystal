import { integrationRequest } from '@@/server/utils/integration-request';

export default defineEventHandler(event => integrationRequest(event, 'GET'));
