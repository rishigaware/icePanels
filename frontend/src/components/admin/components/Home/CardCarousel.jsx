import React, { useState, useEffect,useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./CardCarousel.module.css";
import { Toast } from 'primereact/toast';
import { Carousel as FlowbiteCarousel } from 'flowbite-react';
import { FileUpload } from 'primereact/fileupload';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useUser } from "../../../../context/UserContext";


const CardCarousel = () => {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useRef(null); // Reference for Toast
  const { url } = useUser();  // Get user and setUser from context


  // Fetch images from the backend
  const fetchImages = () => {
    fetch(`${url}/api/admin/get/top-card-carousel`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setImages(data); // Assuming data is an array of images
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };


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

    fetch(`${url}/api/admin/upload/top-card-carousel`, {
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
      const response = await fetch(`${url}/api/admin/delete-one/top-card-carousel`, {
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
    <div className={styles.carousel}>
      {/* Toast component for displaying messages */}
      <Toast ref={toast} />

     {/* File upload component */}
      <div className="my-4 flex items-center ml-2.5">
        <FileUpload
          mode="basic"
          name="image"
          accept="image/*"
          maxFileSize={1000000}
          onSelect={onFileSelect}
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white text-sm px-1 py-2 rounded ml-2.5"
        >
          Upload Image
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white text-sm px-2 py-2 rounded flex items-center ml-2.5"
        >
          <i className="fa fa-trash mr-2"></i> Delete
        </button>
      </div>

      {images.length > 0 ? (
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={`${url}/${image.imagePath}`}
                alt={image.alt || `Slide ${index + 1}`}
                className={styles.image}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-gray-500 text-center">No images available</p>
      )}
    </div>
  );
};

export default CardCarousel;
