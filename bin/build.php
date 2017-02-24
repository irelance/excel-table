<?php
/**
 * Created by PhpStorm.
 * User: irelance
 * Date: 2017/2/21
 * Time: 下午1:10
 */
define('ROOT', dirname(__DIR__));
define('SRC', ROOT . '/src');
define('DIST', ROOT . '/dist');

class Pack
{
    public $target = null;
    public $code='';

    public function __construct($targetName)
    {
        if (!$targetName) {
            $targetName = 'excel-table.min.js';
        }
        $this->target = fopen(DIST . '/' . $targetName, 'w');
    }

    public function __destruct()
    {
        fputs($this->target, $this->code);
        fclose($this->target);
    }

    public function append($fileName)
    {
        $fileName = SRC . '/' . $fileName;
        if (is_file($fileName)) {
            $this->code.=file_get_contents($fileName);
        }
    }

    public function zip()
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://tool.lu/js/ajax.html");
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, [
            'code'=>$this->code,
            'operate'=>'purify',
        ]);
        $output = curl_exec($ch);
        $output=json_decode($output,true);
        $this->code=$output['text'];
        curl_close($ch);
    }

    public function run($arr)
    {
        foreach ($arr as $item) {
            $this->append($item);
        }
        $this->zip();
    }
}

$pack = new Pack('');
$pack->run([
    'functions.js',
    '../require.js',
    'template.js',
    'calculator.js',
    'unit.js',
    'toolbar.js',
    'table.js',
    'table/input.js',
    'table/action.js',
    'table/select-lines.js',
    'table/change-lines.js',
    'table/history.js',
    'table/initialize.js',
]);
