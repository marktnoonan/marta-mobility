<?php

class Asset {
    public $assetUid;
    public $coordinates;

    // Environmental Planning Data
    public $temperature;
    public $humidity;
    public $pressure;

    // Traffic Planning Data
    public $vehicleSpeed;
    public $vehicleCount;

    // Situational Awareness Data
    public $photo_url;
    public $video_url;

    function __construct($assetUid, $coordinates, $temperature = 0, $humidity = 0, $pressure = 0, $vehicleSpeed = 0, $vehicleCount = 0) {
        $this->assetUid = $assetUid;
        $this->coordinates = $coordinates;
        $this->temperature = $temperature;
        $this->humidity = $humidity;
        $this->pressure = $pressure;
        $this->vehicleSpeed = $vehicleSpeed;
        $this->vehicleCount = $vehicleCount;
    }

    public static function parseNode($assetDataArray) {
        var_dump($assetDataArray);
        $asset = new Asset(
            $assetDataArray['assetUid'],
            $assetDataArray['coordinates']
        );
        return $asset;
    }
    public static function parseNodes($assetAssociativeArray) {
        $assets = $assetAssociativeArray['content'];
        $assetArray = array();
        foreach($assets as &$asset) {
            array_push($assetArray,Asset::parseNode($asset));
        }
        unset($asset);
        var_dump($assetArray);
        return $assetArray;
    }
    public static function parseNodeEnvironmentalData($node, $environmentalData){

    }
}