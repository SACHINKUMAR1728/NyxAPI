import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaUserFriends, FaEllipsisV } from 'react-icons/fa';
import nyxLogo from '../assets/nyxLogo.webp';

const EndpointSection = () => {
  const { Projectid } = useParams(); // Retrieve 'Projectid' from the URL
  const [endpoint, setEndpoint] = useState('placetentertext'); // State to manage editable endpoint
  const [isJsonInputVisible, setIsJsonInputVisible] = useState(false); // State to manage visibility of JSON input
  const [jsonData, setJsonData] = useState(''); // State to store the entered JSON data
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const[enpoints, setEndpoints] = useState([]);
  
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  // Convert Projectid to an integer
  const projectIdInt = parseInt(Projectid, 10); // Parse Projectid as an integer

  // Check if projectIdInt is valid
  if (isNaN(projectIdInt)) {
    console.error('Invalid Projectid, expected an integer.');
  }

  // Handle endpoint input changes
  const handleEndpointChange = (e) => {
    setEndpoint(e.target.value); // Update the endpoint path
  };

  // Handle JSON data input changes
  const handleJsonChange = (e) => {
    setJsonData(e.target.value); // Update the JSON data
  };

  // Toggle the visibility of the JSON input box
  const toggleJsonInputVisibility = () => {
    setIsJsonInputVisible(!isJsonInputVisible); // Show/hide the JSON input box
  };

  // Handle the save operation for JSON data and send POST request
  const handleSaveJsonData = async () => {
    try {
      // Validate and parse the JSON input
      const parsedJson = JSON.parse(jsonData); // Validate JSON data

      // Prepare the payload for the POST request
      const payload = {
        Endpoint: endpoint,          // From the input field
        Projectid: projectIdInt,     // From URL params
        Apitype: "GET",              // Fixed API type
        Payload: JSON.stringify(parsedJson) // JSON payload as string
      };

      // Send POST request to /endpoints/
      const response = await axios.post('http://localhost:8000/endpoints/', payload);

      if (response.status === 200) {
        console.log('Endpoint created successfully:', response.data);
        alert('Endpoint created successfully');
      }
    } catch (error) {
      console.error('Error creating endpoint:', error);
      setError('Failed to create endpoint. Ensure the JSON data is valid.');
    }
  };

const fetchEndpointData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/endpoints/${projectIdInt}`);
      const { msg, Projectid, endpoint_info } = response.data;

      // Set the endpoint information in state
      setEndpoints(endpoint_info);
      setJsonData(endpoint_info.payload); // Set the JSON data in the input field
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load endpoint information.'); // Set an error message
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };


  // Fetch emails when the modal opens
  useEffect(() => {

    fetchEndpointData();
   
    if (isModalOpen) {
      const fetchEmails = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/share/${projectIdInt}`);
          setEmails(response.data.emails);
        } catch (error) {
          console.error('Error fetching emails:', error);
          setError('Failed to load emails.');
        }
      };

      fetchEmails();
    }
  }, [isModalOpen, projectIdInt, Projectid]);






  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await axios.post('http://localhost:8000/share/', {
          projectid: projectIdInt,
          email,
        });

        if (response.status === 200) {
          // Add the email to the list
          setEmails((prev) => [...prev, email]);
          setEmail(''); // Clear input field
          toggleModal(); // Close the modal
        } else {
          setError('Failed to add email.');
        }
      } catch (error) {
        console.error('Error adding email:', error);
        setError('Failed to add email.');
      }
    }
  };
  const handleRemoveEmail = async (emailToRemove) => {
    const confirmRemove = window.confirm(`Are you sure you want to remove ${emailToRemove}?`);
    
    if (confirmRemove) {
      try {
        const response = await axios.delete(`http://localhost:8000/share/remove`, {
          params: {
            projectid: projectIdInt,
            user_email: emailToRemove,
          },
        });

        if (response.status === 200) {
          // Remove the email from the local state
          setEmails((prev) => prev.filter((email) => email !== emailToRemove));
          // Optionally show success message
          toggleModal(); // Close the modal on success
        } else {
          setError('Failed to remove email.');
        }
      } catch (error) {
        console.error('Error removing email:', error);
        setError('Failed to remove email.');
      }
    }
  };

  return (
    <>
    <div className="flex flex-col items-center min-h-screen pt-16 text-white bg-gray-900">
      <div className="flex items-center justify-between w-full max-w-3xl mb-4">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">
            Projects / 
          </h1>
          <img 
            src={nyxLogo} 
            alt="NyxAPI Logo" 
            className="w-8 h-8 mx-2"
          />
          <span className="text-3xl font-bold text-pink-600">NyxAPI</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <FaUserFriends onClick={toggleModal} className="text-xl text-gray-400 cursor-pointer hover:text-white" title="Collaborators" />
          <FaEllipsisV className="text-xl text-gray-400 cursor-pointer hover:text-white" title="More options" />
        </div>
      </div>

      <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-lg">
        <h2 className="mb-4 text-2xl font-bold text-white">API endpoint</h2>
        
        {/* Flex container to keep the span and input on the same line */}
        <div className="flex items-center mb-4">
          {/* Static and uneditable part of the URL */}
          <Link to={`http://${projectIdInt}.localhost:8001/${endpoint}`}>
            <span className="inline-block p-2 font-mono text-sm text-blue-800 bg-blue-100 rounded-l whitespace-nowrap">
              http://{projectIdInt}.nyxapi.com/
            </span>
          </Link>

          {/* Editable part of the URL */}
          <input
            type="text"
            value={endpoint}
            onChange={handleEndpointChange}
            className="w-full p-2 font-mono text-sm text-blue-800 bg-white rounded-r focus:outline-none flex-grow"
            placeholder="enter-endpoint-path"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleJsonInputVisibility}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            New resource
          </button>
          <button className="px-4 py-2 text-gray-200 bg-gray-700 rounded hover:bg-gray-600">
            Generate all
          </button>
          <button className="px-4 py-2 text-gray-200 bg-gray-700 rounded hover:bg-gray-600">
            Reset all
          </button>
        </div>

        {/* Show input box for JSON data and save button */}
        {isJsonInputVisible && (
          <div className="mt-6">
            <h3 className="mb-2 text-xl font-semibold text-white">Enter JSON Data:</h3>
            <textarea
              value={jsonData}
              onChange={handleJsonChange}
              placeholder="Enter your JSON data here"
              rows="6"
              className="w-full p-4 font-mono text-sm text-gray-900 bg-white rounded-lg focus:outline-none"
            />
            {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
            <button
              onClick={handleSaveJsonData}
              className="px-4 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        )}


        <div className="mt-8">

          <h3 className="mb-2 text-xl font-semibold text-white">Endpoints:</h3>
          <ul>
            {enpoints.map((endpoint) => (
              <li key={endpoint.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                <span className="font-mono text-sm text-blue-800">
                  http://{projectIdInt}.nyxapi.com/{endpoint.Endpoint}
                </span>
                <span className="text-sm text-gray-400">
                  {endpoint.Payload}
                </span>
              </li>
            ))}
          </ul>
          
          </div>

        
      </div>
    </div>
    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-800 p-6 rounded-lg w-1/3">
          <h3 className="text-xl font-semibold text-white mb-4">Add Collaborator</h3>
          <form onSubmit={handleAddEmail}>
            <div className="mb-4">
              <label className="block text-gray-400">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 bg-gray-700 text-white rounded focus:outline-none"
                required
              />
            </div>

            {error && <p className="text-red-500">{error}</p>} {/* Display error message */}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={toggleModal}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
              >
                Add
              </button>
            </div>
          </form>

          {/* Display list of shared emails */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-white mb-2">Shared Emails:</h4>
            <ul className="list-disc list-inside">
            {emails.map((emailItem) => (
  emailItem !== userData.email && ( // Check if the email is not equal to userData.email
    <li key={emailItem} className="flex justify-between items-center text-gray-300">
      {emailItem}
      <button
        onClick={() => handleRemoveEmail(emailItem)}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        ✖️
      </button>
    </li>
  )
))}
            </ul>
          </div>
        </div>
      </div>
    )}
    

    </>
  );
};


const EndpointSectionforjson = () => {
  const { Projectid } = useParams();
  const [jsonData, setJsonData] = useState('{}'); // State to store the entered JSON data
  const [error, setError] = useState(''); // Error state
  const websocketRef = useRef(null); // Reference to the WebSocket connection

  // Connect to the WebSocket when the component mounts
  useEffect(() => {
    const websocketUrl = `ws://127.0.0.1:8000/ws/${Projectid}`;
    console.log(`Connecting to WebSocket for project: ${Projectid}`);

    websocketRef.current = new WebSocket(websocketUrl);

    // Handle WebSocket messages
    websocketRef.current.onmessage = (event) => {
      try {
        // Update the JSON data when received from the server
        const newData = JSON.parse(event.data);
        setJsonData(JSON.stringify(newData, null, 2)); // Pretty-print the JSON
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    websocketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket error');
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      // Close the WebSocket connection when the component unmounts
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [Projectid]);

  // Handle changes in the JSON input
  const handleJsonChange = (e) => {
    const newJsonData = e.target.value;
    setJsonData(newJsonData);

    // Send the updated JSON to the WebSocket server
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(newJsonData);
    }
  };

  return (
    <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Edit JSON Data for Project {Projectid}</h2>
      <textarea
        value={jsonData}
        onChange={handleJsonChange}
        className="w-full h-96 p-4 bg-gray-900 text-white rounded-lg resize-none"
      ></textarea>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};




const EndpointScreen = () => {
  return (
    <>
      <EndpointSection />
      <EndpointSectionforjson />
    </>
  );
};

export default EndpointScreen;
