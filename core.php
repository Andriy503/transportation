<?php

class Core {
    public $connection = null;
    public $sqlGetTransportations = 'SELECT
        transportation.id as t_id,
        transportation.*, auto.*, drivers.*, customers.*
        FROM `transportation`
        LEFT JOIN `auto` ON (auto.id = transportation.id_auto) 
        LEFT JOIN `drivers` ON (drivers.id = transportation.id_driver)
        LEFT JOIN `customers` ON (customers.id = transportation.id_customer)
    ';

    function __construct() {
        $this->connection = new PDO('mysql:host=localhost;dbname=cargo_transportation', 'root', 'summer');
    }
    
    function getAllTransportation() {
        $query = $this->connection->query($this->sqlGetTransportations);
        $transportations = $query->fetchAll(PDO::FETCH_ASSOC);

        // Auto
        $sqlGetAllAuto = 'SELECT * FROM `auto`';
        $queryAuto = $this->connection->query($sqlGetAllAuto);
        $auto = $queryAuto->fetchAll(PDO::FETCH_ASSOC);

        // Drivers
        $sqlGetAllDrivers = 'SELECT * FROM `drivers`';
        $queryDrivers= $this->connection->query($sqlGetAllDrivers);
        $drivers = $queryDrivers->fetchAll(PDO::FETCH_ASSOC);

        // Customers
        $sqlGetAllCustomers = 'SELECT * FROM `customers`';
        $queryCustomers = $this->connection->query($sqlGetAllCustomers);
        $customers = $queryCustomers->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'transportations' => $transportations,
            'auto' => $auto,
            'drivers' => $drivers,
            'customers' => $customers
        ]);
    }
    
    public function addNewTransportation() {
        $params = $_POST;
        $sql = "INSERT INTO `transportation` 
            ( " .implode(' ,', array_keys($params)). " ) 
            VALUES ( ?, ?, ?, ?, ?, ? )
        ";

        $query = $this->connection->prepare($sql);
        $query->execute(array_values($params));

        $id = $this->connection->lastInsertId();

        $lastTranstortationSql = $this->sqlGetTransportations . 'WHERE transportation.id = :id';
        $queryL = $this->connection->prepare($lastTranstortationSql);
        $queryL->execute([':id' => $id]);
        $transtortation = $queryL->fetchAll(PDO::FETCH_ASSOC)[0];

        if (count($transtortation)) {
            echo json_encode([
                'success' => true,
                'message' => 'Request successfully added',
                'transtortation' => $transtortation
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Not found'
            ]);
        }
    }

    public function updateTransportation() {
        echo json_encode([
            'data' => 'success'
        ]);
    }
}

