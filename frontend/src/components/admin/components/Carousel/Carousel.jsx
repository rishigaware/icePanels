import React, { useState, useEffect, useRef } from 'react';
import { Carousel as FlowbiteCarousel } from 'flowbite-react';
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useUser } from "../../../../context/UserContext";

export default function Carousel() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useRef(null); // Reference for Toast
  const { url } = useUser();  // Get user and setUser from context

  // Fetch images from the backend
  const fetchImages = () => {
    fetch(`${url}/api/admin/get/top-carousel`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setImages(data);
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch images.',
          life: 3000,
        });
      });
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Log images after they are updated
  useEffect(() => {
    // console.log('Updated images:', images);
  }, [images]);

  // Function to handle file selection
  const onFileSelect = (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        
        // Enhanced file validation
        if (selectedFile.size > 10000000) { // Increased to 10MB
          throw new Error('File is too large. Max size is 10MB.');
        }
        
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        
        setSelectedFile(selectedFile);
        toast.current.show({
          severity: 'success',
          summary: 'File Selected',
          detail: `${selectedFile.name} selected successfully`,
          life: 2000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'File Selection Failed',
        detail: error.message,
        life: 3000,
      });
      setSelectedFile(null);
    }
  };

  // Function to handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.current.show({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select an image file first.',
        life: 3000,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Show loading toast
      toast.current.show({
        severity: 'info',
        summary: 'Uploading...',
        detail: 'Please wait while your image is being uploaded.',
        life: 2000,
      });

      const response = await fetch(`${url}/api/admin/upload/top-carousel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the images state with the new image path returned from the backend
      setImages((prevImages) => [...prevImages, data]);
      setSelectedFile(null); // Clear the selected file after successful upload
      
      toast.current.show({
        severity: 'success',
        summary: 'Upload Successful',
        detail: `${selectedFile.name} uploaded successfully`,
        life: 3000,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error.message || 'Failed to upload image. Please try again.',
        life: 4000,
      });
    }
  };

  // Function to handle deletion of a specific image
  const handleDelete = async (imageIndex = null) => {
    try {
      if (images.length === 0) {
        toast.current.show({
          severity: 'warn',
          summary: 'No Images',
          detail: 'No images available to delete.',
          life: 3000,
        });
        return;
      }

      // If no specific index provided, delete the last image
      const indexToDelete = imageIndex !== null ? imageIndex : images.length - 1;
      const imageToDelete = images[indexToDelete];

      // Show confirmation toast
      toast.current.show({
        severity: 'info',
        summary: 'Deleting...',
        detail: 'Please wait while the image is being deleted.',
        life: 2000,
      });

      // Call the API to delete the specific image
      const response = await fetch(`${url}/api/admin/delete-one/topcarousel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageIndex: indexToDelete,
          imagePath: imageToDelete.imagePath 
        }),
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Remove the image from local state immediately for better UX
      setImages(prevImages => prevImages.filter((_, index) => index !== indexToDelete));

      toast.current.show({
        severity: 'success',
        summary: 'Delete Successful',
        detail: 'Image deleted successfully',
        life: 3000,
      });
      
      console.log("File deleted and database updated.");
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Delete Failed',
        detail: error.message || 'Failed to delete image. Please try again.',
        life: 4000,
      });
      
      // Refresh images in case of error to ensure consistency
      fetchImages();
    }
  };

  return (
    <div className="w-screen h-auto">
      {/* Toast component for displaying messages */}
      <Toast ref={toast} />

      {/* File upload component */}
      <div className="my-4 flex items-center ml-2.5 gap-3">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-semibold"
          >
            <i className="fa fa-image mr-2"></i> Choose Image
          </label>
        </div>
        
        {selectedFile && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            Selected: {selectedFile.name}
          </div>
        )}
        
        <button
          onClick={handleUpload}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          disabled={!selectedFile}
          style={{
            opacity: selectedFile ? 1 : 0.6,
            cursor: selectedFile ? 'pointer' : 'not-allowed'
          }}
        >
          <i className="fa fa-upload mr-2"></i> Upload Image
        </button>
        
        <button
          onClick={() => handleDelete()}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
          disabled={images.length === 0}
          style={{
            opacity: images.length > 0 ? 1 : 0.6,
            cursor: images.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          <i className="fa fa-trash mr-2"></i> Delete Last
        </button>
      </div>

      {/* Carousel component */}
      <div className="w-screen h-40 sm:h-64 xl:h-60 2xl:h-96">
        {images.length > 0 ? (
          <FlowbiteCarousel>
            {images.map((image, index) => {
              const imageUrl = `${url}/${image.imagePath}`;
              // console.log('Image URL:', imageUrl); // Log the image URL to check
              return (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              );
            })}
          </FlowbiteCarousel>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>
    </div>
  );
}

