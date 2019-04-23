<?php
    header('Access-Control-Allow-Origin: *');
    // header('Access-Control-Allow-Headers: Origin, Content-Type, Authorization, X-Auth-Token, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    header('Content-Type: application/json');

    include('core.php');
    $core = new Core();

    $method = $_SERVER['REQUEST_METHOD'];

    var_dump($method);

    switch ($method) {
        case 'GET':
            $core->getAllTransportation();
            break;
        
        case 'POST':
            $core->addNewTransportation();
            break;
        
        case 'PUT':
            $core->updateTransportation();
            break;
        
        case 'DELETE': 
            break;
    }