import React, { useState, useRef, useEffect } from "react";
import styles from "./CreateId.module.css"; 
import { useUser } from "../../context/UserContext"; 
import { FileUpload } from "primereact/fileupload";
import { PulseLoader } from "react-spinners";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { MdDeleteForever } from "react-icons/md";
import { FaTrash } from "react-icons/fa";


const CreateId = () => {
  const { user, setUser, url } = useUser();
  const toast = useRef(null); // Add a reference for Toast
 

  //  new Website Modal State
  const [newWebsite, setNewWebsite] = useState({
    id: "",
    website: "",
    url: "",
    logo: "",
    category: "",
  });

  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]); // Categories from websites
  const [menuOpen, setMenuOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false); // State for Add Website modal
  const [file, setFile] = useState(null); // State to store the selected file


  const [searchQuery, setSearchQuery] = useState(""); // Search bar state
  const [selectedCategory, setSelectedCategory] = useState("All Categories"); 

  // Function to fetch websites data
  const fetchWebsites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/api/admin/get-websites`);
      const data = await response.json();
      if (response.ok) {
        // console.log(data,"<<<")
        setWebsites(data.websites); // Assuming the API returns an object with a "websites" key
      } else {
        console.error("Error fetching websites:", data);
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch categories from websites
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/api/admin/get-all-categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        console.error("Error fetching categories:", data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch data when the component loads
  useEffect(() => {
    fetchWebsites();
    fetchCategories();
  }, []);

  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

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
        setFile(selectedFile);
        setNewWebsite((prev) => ({
          ...prev,
          logo: selectedFile, // Update logo field in state
        }));
        toast.current.show({
          severity: 'success',
          summary: 'File Selected',
          detail: 'File uploaded successfully',
          life: 1000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'File Upload Failed',
        detail: error.message,
        life: 3000,
      });
    }
  };

  const handleFocus = () => {
    setErrorMessage("");
  };
  
  

  const handleAddWebsite = async () => {
    if (!newWebsite.website || !newWebsite.url || !newWebsite.category || !file) {
      setErrorMessage("All fields are required to add a website, including the logo.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("website", newWebsite.website);
      formData.append("url", newWebsite.url);
      formData.append("category", newWebsite.category);
      formData.append("logo", file);

      const response = await fetch(`${url}/api/admin/add-website`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Website Added',
          detail: 'Website Added successfully',
          life: 1000,
        });
        setShowAddModal(false);
        setNewWebsite({ id: "", website: "", url: "", category: "", logo: "" });
        setFile(null);
        fetchWebsites(); // Re-fetch the data after adding a new website
        fetchCategories(); // Also refresh categories
        // console.log("Website added successfully:");
      } else {
        
        console.error("Error adding website:");
        setErrorMessage(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setErrorMessage("Request failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleCreate = (id) => {
    // Find the website by its unique ID, instead of using the index
    const website = websites.find(item => item.id === id); 
    // console.log(website)
    setSelectedWebsite(website); 
    setMenuOpen(null); // Close the menu
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsername(""); // Reset username
    setPassword(""); // Reset password
    setErrorMessage(""); // Reset error message
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  const filteredWebsites = (websites || []).filter((item) => {
    // Matches search query for website name or URL
    const websiteName = item.name || item.website || '';
    const matchesSearchQuery =
      websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()));
  
    // Matches the selected category
    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;
  
    return matchesSearchQuery && matchesCategory;
  });
  
  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("User must be logged in to create an ID.");
      return;
    }
  
    const { websiteName, websiteUrl, imgUrl } = {
      websiteName: selectedWebsite.website,
      websiteUrl: selectedWebsite.url,
      imgUrl: selectedWebsite.logo,
    };
  
    
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/api/user/create-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteName,
          websiteUrl,
          username,
          password,
          imgUrl,
          createdBy: user.username,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'ID Created',
          detail: 'ID created successfully:',
          life: 1000,
        });
        setShowModal(false);
      } else {
        console.error("Error creating ID:", data);
        setErrorMessage(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setErrorMessage("Request failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  
  // Function to handle the delete action
  const handleDelete = async (item) => {
    try {
      const itemId = item.id
      // Replace with your API endpoint
      const response = await fetch(`${url}/api/admin/delete-website/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchWebsites();
        fetchCategories(); // Also refresh categories
        toast.current.show({
          severity: 'error',
          summary: 'Website deleted',
          detail: 'Website deleted successfully:',
          life: 1000,
        });
        // console.log('Item deleted successfully');
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <PulseLoader color="#4592ef" loading={isLoading} size={15} />
        </div>
      )}

          {/* <button
          className={styles.addWebsiteButton}
          onClick={() => setShowAddModal(true)}
          >
          Add Website
          </button> */}
      <div className={styles.searchSortWrapper}>
        <input
          type="text"
          placeholder="Search websites..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        {/* Category Dropdown */}
        <select 
          value={selectedCategory} 
          onChange={handleCategoryChange} 
          className={styles.categoryDropdown}
        >
          <option value="All Categories">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
       </div>
       {/* Loader when data is fetching */}
      
      {/* Website List */}
        {filteredWebsites.length > 0 ? (
          filteredWebsites.map((item, index) => (
            <div key={item.id || index} className={styles.websiteCard}>
              <div className={styles.websiteInfo}>
                <img
                  src={`${url}/${item.logo}`}
                  alt={item.name || item.website || 'Website Logo'}
                  className={styles.websiteLogo}
                />
                <div className={styles.websiteDetails}>
                  <h3>{item.name || item.website || 'Unnamed Website'}</h3>
                  <p>{item.url || 'No URL'}</p>
                  <span className={styles.categoryTag}>
                    {item.category || 'No Category'}
                  </span>
                  {item.coinRate && (
                    <p className={styles.coinInfo}>
                      <strong>Coin Rate:</strong> {item.coinRate}
                    </p>
                  )}
                  {item.minimumCoins && (
                    <p className={styles.coinInfo}>
                      <strong>Min Coins:</strong> {item.minimumCoins}
                    </p>
                  )}
                  {item.createdAt && (
                    <p className={styles.dateInfo}>
                      <strong>Added:</strong> {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {item.isActive !== undefined && (
                    <span className={`${styles.statusTag} ${item.isActive ? styles.activeStatus : styles.inactiveStatus}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
                <div className={styles.websiteActions}>
                  <button
                    onClick={() => handleCreate(item.id)}
                    className={styles.actionButton}
                  >
                    Create ID
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.loading}>
            {searchQuery || selectedCategory !== "All Categories" 
              ? "No websites found matching your criteria." 
              : "No websites available."}
          </div>
        )}


       {/* Modal Popup for Creating ID */}
       {showModal && selectedWebsite && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <img
                src={`${url}/${selectedWebsite.logo}`}
                alt={`${selectedWebsite.website} logo`}
                className={styles.websiteLogo}
              />
              <h2>{selectedWebsite.website}</h2>
              <a
                href={selectedWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.websiteLink}
              >
                {selectedWebsite.url}
              </a>
            </div>

             {/* Modal Body */}
             <div className={styles.modalBody}>
               <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
              />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />
              <button
                onClick={handleSubmit}
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create ID"}
                
              </button>
            </div>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

             {/* Close Button */}
             <button onClick={handleCloseModal} className={styles.closeButton}>
               Close
             </button>
           </div>
         </div>
      )}

    {/* {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2><strong>Add Website</strong></h2>
            <h4>Website name</h4>
            <input
              type="text"
              placeholder="Enter website name"
              value={newWebsite.website}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, website: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />
            <h4>Website URL</h4>
            <input
              type="text"
              placeholder="Enter Website URL"
              value={newWebsite.url}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, url: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />

            <h4>Category</h4>
            <input
              type="text"
              placeholder="Enter Category"
              value={newWebsite.category}
              onChange={(e) =>
                setNewWebsite({ ...newWebsite, category: e.target.value })
              }
              className={styles.inputField}
              onFocus={handleFocus}

            />
            <h4>Select Website Logo</h4>

             <div className={styles.uploadSection}>
              <FileUpload
                mode="basic"
                name="image" // Adjust this based on your backend's expected field name
                url="/api/upload"
                accept="image/*"
                maxFileSize={1000000}
                onSelect={onFileSelect}
                onFocus={handleFocus}

                />
              </div>
            
            <button
              onClick={handleAddWebsite}
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className={styles.closeButton}
            >
              Close
            </button>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          </div>
        </div>
      )} */}
      <Toast ref={toast} />

      
    </div>
  );
};

export default CreateId;
