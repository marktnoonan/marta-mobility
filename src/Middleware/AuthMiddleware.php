<?php

namespace Paratransit\Middleware;

use Interop\Container\ContainerInterface;

class AuthMiddleware {
    protected $c;

    public function __construct(ContainerInterface $container)
    {
        $this->c = $container;
    }

    public function __invoke($request, $response, $next)
    {
        if ($request->getMethod() == 'POST') {
            $params = $request->getParsedBody();
            if (!empty($params['username']) && !empty($params['password'])) {
                $this->c['auth']->auth($params['username'], $params['password']);
            }
        }
        if ($this->c['auth']->getAuth() === false) {
            $response = $response->withStatus(401);
            return $response;
        }
        $response = $next($request, $response);
        return $response;
    }
}