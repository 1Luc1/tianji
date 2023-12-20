import { http } from './http';
import { ping } from './ping';
import { openai } from './openai';
import type { MonitorProvider } from './type';

export const monitorProviders: Record<string, MonitorProvider<any>> = {
  ping,
  http,
  openai,
};
