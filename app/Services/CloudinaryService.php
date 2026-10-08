<?php

namespace App\Services;

use Cloudinary\Cloudinary;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(
            sprintf(
                'cloudinary://%s:%s@%s',
                config('cloudinary.api_key'),
                config('cloudinary.api_secret'),
                config('cloudinary.cloud_name')
            )
        );
    }


    public function upload($file, $folder = 'expenses')
    {
        return $this->cloudinary
            ->uploadApi()
            ->upload(
                $file->getRealPath(),
                [
                    'folder' => $folder,
                ]
            );
    }


    public function destroy($publicId)
    {
        return $this->cloudinary
            ->uploadApi()
            ->destroy($publicId);
    }
}
