<?php

class Asset {
    public $assetUid;

    // Environmental Planning Data
    public $temperature;
    public $humidity;
    public $pressure;

    // Traffic Planning Data
    public $vehicleSpeed;
    public $vehicleCount;

    function __construct($temperature = 0, $humidity = 0, $pressure = 0, $vehicleSpeed = 0, $vehicleCount = 0) {
        $this->temperature = $temperature;
        $this->humidity = $humidity;
        $this->pressure = $pressure;
        $this->vehicleSpeed = $vehicleSpeed;
        $this->vehicleCount = $vehicleCount;
    }

    function parseNode($JSONString) {
        $dataArray = json_decode($JSONString, true);
        var_dump($dataArray);
    }
}