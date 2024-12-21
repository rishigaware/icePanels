import React, { useState, useEffect, useRef } from 'react';
import { Carousel as FlowbiteCarousel } from 'flowbite-react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useUser } from "../../context/UserContext";


export default function MiddleCarousel() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useRef(null); // Reference for Toast
  const { user, setUser, url } = useUser();

  // Fetch images from the backend
  const fetchImages = () => {
    fetch(`${url}/api/admin/get/middle-carousel`)
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
      if (e.files && e.files[0]) {
        const selectedFile = e.files[0];
        if (selectedFile.size > 1000000) {
          throw new Error('File is too large. Max size is 1MB.');
        }
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        setSelectedFile(selectedFile);
        toast.current.show({
          severity: 'success',
          summary: 'File Selected',
          detail: 'Image uploaded successfully',
          life: 2000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Image Upload Failed',
        detail: error.message,
        life: 3000,
      });
    }
  };

  // Function to handle file upload
  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    fetch(`${url}/api/admin/upload/middle-carousel`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the images state with the new image path returned from the backend
        setImages((prevImages) => [...prevImages, data]);
        setSelectedFile(null); // Clear the selected file after successful upload
        toast.current.show({
          severity: 'success',
          summary: 'Image Added',
          detail: 'Image Added successfully',
          life: 2000,
        });
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Add Failed',
          detail: 'Failed to Add image.',
          life: 3000,
        });
      });
  };

  // Function to handle deletion
  const handleDelete = async () => {
    try {
      // Call the API to delete an item from the top carousel
      const response = await fetch(`${url}/api/admin/delete-one/middlecarousel`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file from database');
      }
      // Fetch the updated images after deletion
      fetchImages();

      toast.current.show({
        severity: 'success',
        summary: 'Deleted Successfully',
        detail: 'Successfully deleted image:',
        life: 2000,
      });
      
      console.log("File deleted and database updated.");
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error deleting:',
        detail: "Error deleting image:",
        life: 2000,
      });
    }
  };

  return (
    <div className="w-screen h-auto">
      {/* Toast component for displaying messages */}
      <Toast ref={toast} />

      {/* File upload component */}
      {/* <div className="my-4 flex items-center ml-2.5">
        <FileUpload
          mode="basic"
          name="image"
          accept="image/*"
          maxFileSize={1000000}
          onSelect={onFileSelect}
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-2 py-2 rounded ml-2.5"
        >
          Upload Image
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-2 py-2 rounded flex items-center ml-2.5"
        >
          <i className="fa fa-trash mr-2"></i> Delete
        </button>
      </div> */}

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

