const cloudinary = require('cloudinary').v2; // Import v2 for Cloudinary

          
cloudinary.config({ 
  cloud_name: 'doi88vbcz', 
  api_key: '239115282668571', 
  api_secret: 'aOcYjdJnLEQGRpZkmbC0LC7RBMw' 
});

const cloudinaryUploadImg = async (fileToUpload) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(fileToUpload, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: result.secure_url,
                });
            }
        });
    });
};

module.exports = cloudinaryUploadImg;
