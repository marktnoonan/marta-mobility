<?php

class DecisionTree {
    public static function classify($assetArray) {
        // TODO: Replace the sampleTree call with the generated decision tree to do the classification
        return DecisionTree::sampleTree($assetArray);
    }

    private static function sampleTree($assetArray){
        // TODO: Replace hardcoded sample decision tree with dataset trained tree
        $vehicleSpeedThreshold = 10;
        $vehicleCountThreshold = 30;
        $temperatureThreshold = 300; // Kelvin
        $humidityThreshold = 50; // Pascals
        $estimatedDelay = Delay::NONE;

        foreach($assetArray as $asset) {
            if($asset->vehicleSpeed < $vehicleSpeedThreshold) {
                if($asset->vehicleCount < $vehicleCountThreshold){
                    return $estimatedDelay = Delay::LARGE;
                } else {
                    return $estimatedDelay = Delay::MEDIUM;
                }
            } else {
                if($asset->humidity > $humidityThreshold) {
                    return $estimatedDelay = Delay::MEDIUM;
                } else {
                    if ($asset->temperature > $temperatureThreshold || -$asset->temperature < $temperatureThreshold) {
                        return $estimatedDelay = Delay::SMALL;
                    }
                }
            }
        }
        return $estimatedDelay;
    }

}