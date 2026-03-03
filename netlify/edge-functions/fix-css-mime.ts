export default async (request: Request, context: any) => {
  const response = await context.next();
  const url = new URL(request.url);
  
  // Fix CSS MIME type
  if (url.pathname.endsWith('.css')) {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/css; charset=utf-8');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  
  return response;
}

export const config = {
  path: "/_next/static/*"
};
