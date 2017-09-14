<?php

namespace Paratransit;
use \Interop\Container\ContainerInterface;

class Auth
{
    protected $auth;
    protected $c;
    protected $martaCookies = [];

    public function __construct(ContainerInterface $container)
    {
        global $_SESSION;
        $this->auth = false;
        $this->c = $container;
        if (!empty($_SESSION['auth'])) {
            $this->auth = $_SESSION['auth']['auth'];
            $this->martaCookies = $_SESSION['auth']['martaCookies'];
        }
    }

    public function getAuth()
    {
        return $this->auth;
    }

    public function auth($username, $password)
    {
        global $_SESSION;
        if (strtolower($username) === 'test' && strtolower($password) === 'test') {
            //test credentials
            //TODO: disable this in production environment
            $this->auth = [
                'username' => $username
            ];
        } else {
            try {
                $this->auth = $this->martaLogin($username, $password);
            } catch (\Exception $e) {
                $this->auth = false;
            }
        }
        if ($this->auth !== false) {
            $_SESSION['auth'] = [
                'auth' => $this->auth,
                'martaCookies' => $this->martaCookies
            ];
        }
    }

    public function logout()
    {
        $this->auth = false;
        session_destroy();
    }

    public function getUsername()
    {
        $username = false;
        if (!empty($this->auth)) {
            $username = $this->auth['username'];
        }
        return $username;
    }

    public function getMartaCookies()
    {
        if (!empty($this->auth)) {
            return $this->martaCookies;
        } else {
            return false;
        }
    }

    private function martaLogin($username, $password)
    {
        //URL of the login form.
        $loginFormUrl = $loginActionUrl = 'http://mobility.itsmarta.com/hiwire';    

        $postValues = array(
            'UN' => $username,
            'PW' => $password
        );
        
        $curl = $this->c['curl'];
        curl_setopt($curl, CURLOPT_URL, $loginActionUrl);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($postValues));
        curl_setopt($curl, CURLOPT_REFERER, $loginFormUrl);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
    
        $data = curl_exec($curl);
        //Check for errors
        if(curl_errno($curl)){
            throw new \Exception(curl_error($curl));
        }
        $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        $header = substr($data, 0, $header_size);
        
        preg_match_all("/^Set-cookie: (.*?);/ism", $header, $cookies);
        foreach($cookies[1] as $cookie){
            $buffer_explode = strpos($cookie, "=");
            $this->martaCookies[ substr($cookie,0,$buffer_explode) ] = substr($cookie,$buffer_explode+1);
        }
    
    }
}