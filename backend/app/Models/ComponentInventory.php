<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComponentInventory extends Model
{
    protected $table = 'component_inventory';

    protected $fillable = ['part_name', 'quantity'];
}
