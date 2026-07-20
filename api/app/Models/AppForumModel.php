<?php
namespace App\Models;

use CodeIgniter\Model;

class AppForumModel extends Model
{
    protected $table         = 'app_forum';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'content_tw',
        'content_en',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
