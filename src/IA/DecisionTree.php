<?php

class DecisionTree {
    public static function classify($assetArray) {
        // TODO: Replace the sampleTree call with the generated decision tree to do the classification
        return DecisionTree::sampleTree($assetArray);
    }

    private static function sampleTree($assetArray){
        // TODO: Replace mock response with the decision tree classification result
        return Delay::LARGE;
    }

}