<?php
class DebugVerbosity {
    // Delay unit is minutes
    const PRODUCTION = 0; // Production
    const MINOR = 10; // Minor tracking calls
    const MEDIUM = 20; // Unstable code
    const LARGE = 30; // Stable code
    const ALL = 100;
}