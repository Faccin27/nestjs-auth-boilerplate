import { FastifyRequest } from 'fastify';

/**
 * Extrai o IP real do cliente do request
 * Considera proxies e headers X-Forwarded-For
 */
export function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  const realIp = request.headers['x-real-ip'];
  
  if (forwarded) {
    // X-Forwarded-For pode conter múltiplos IPs separados por vírgula
    // O primeiro é o IP original do cliente
    return Array.isArray(forwarded) 
      ? forwarded[0].split(',')[0].trim()
      : forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  
  // Fallback para o IP do socket
  return request.socket.remoteAddress || 'unknown';
}

