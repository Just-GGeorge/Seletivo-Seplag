export type NotificationDto = {
  type: string;            
  entity: string;         
  entityId: number;
  title?: string | null;
  message: string;
  timestamp: string;       
  meta?: Record<string, any>;
};
