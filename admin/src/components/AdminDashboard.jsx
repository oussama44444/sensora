import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStories } from '../../hooks/useStories.jsx';
import StoryList from '../components/StoryList';
import StoryForm from '../components/StoryForm';
import axios from "axios";

export default function AdminDashboard({ initialView = 'list' }) {
  const { id } = useParams(); // For edit route
  const navigate = useNavigate();
  const location = useLocation(); // <- new
  const { stories, loading, error, createStory, updateStory, deleteStory, fetchStories } = useStories();
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showDetails, setShowDetails] = useState(false); // <-- new

  // If we have an ID from URL, load that story for editing
  useEffect(() => {
    if (id && stories.length > 0) {
      const storyToEdit = stories.find(story => story._id === id);
      if (storyToEdit) {
        setSelectedStory(storyToEdit);
        setCurrentView('edit');
      }
    }
  }, [id, stories]);

  // NEW: sync currentView with location pathname so route navigation (Links) updates UI instantly
  useEffect(() => {
    const path = location.pathname || '';
    if (path.endsWith('/create')) {
      setCurrentView('create');
      setSelectedStory(null);
    } else if (path.includes('/edit/')) {
      // keep selectedStory if already set by id effect; otherwise set view to edit and wait for id effect to populate selectedStory
      setCurrentView('edit');
    } else {
      setCurrentView('list');
      setSelectedStory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Force admin UI to use a dynamic API base (env > current host:5000) and rewrite localhost if found
  useEffect(() => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const fallbackApi = `${protocol}//${host}:5000`;
    const apiBase = (import.meta?.env?.VITE_API_URL || fallbackApi).replace(/\/+$/, "");
    axios.defaults.baseURL = apiBase;

    const origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
    if (origOpen) {
      window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        try {
          if (typeof url === "string" && url.startsWith("http://localhost:5000")) {
            url = url.replace("http://localhost:5000", apiBase);
          }
        } catch {}
        return origOpen.call(this, method, url, async, user, password);
      };
    }
    console.log("📡 Admin API base URL set to:", apiBase);
  }, []);

  // Upload audio to backend and get Cloudinary URL
  const handleAudioUpload = async (file) => {
    const fd = new FormData();
    fd.append("audio", file);
    const res = await axios.post(`/stories/upload-audio`, fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.audioUrl;
  };

  // Upload image to backend and get Cloudinary URL
  const handleImageUpload = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await axios.post(`/stories/upload-image`, fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.imageUrl;
  };

const handleCreateStory = async (storyData) => {
  console.log('📦 Received storyData:', storyData);

  // Always require an image file for creation
  if (!(storyData.image && storyData.image instanceof File)) {
    alert("Please upload an image file.");
    return;
  }

  // Prepare stages data first
  let stagesData = [...storyData.stages];
  
  // Upload audio files for each segment
  for (const stage of stagesData) {
    if (Array.isArray(stage.segments)) {
      for (const segment of stage.segments) {
        // Upload French audio if it's a File object
        if (segment.audio?.fr instanceof File) {
          try {
            const audioUrl = await handleAudioUpload(segment.audio.fr);
            segment.audio.fr = audioUrl;
          } catch (error) {
            console.error('Error uploading French audio:', error);
            alert('Error uploading French audio file');
            return;
          }
        }
        
        // Upload Tunisian audio if it's a File object and exists
        if (segment.audio?.tn instanceof File) {
          try {
            const audioUrl = await handleAudioUpload(segment.audio.tn);
            segment.audio.tn = audioUrl;
          } catch (error) {
            console.error('Error uploading Tunisian audio:', error);
            alert('Error uploading Tunisian audio file');
            return;
          }
        }
        
        // NEW: question.questionAudio uploads (optional, per language)
        if (segment.question?.questionAudio?.fr instanceof File) {
          try {
            const audioUrl = await handleAudioUpload(segment.question.questionAudio.fr);
            segment.question.questionAudio.fr = audioUrl;
          } catch (error) {
            console.error('Error uploading French question audio:', error);
            alert('Error uploading French question audio file');
            return;
          }
        }
        if (segment.question?.questionAudio?.tn instanceof File) {
          try {
            const audioUrl = await handleAudioUpload(segment.question.questionAudio.tn);
            segment.question.questionAudio.tn = audioUrl;
          } catch (error) {
            console.error('Error uploading Tunisian question audio:', error);
            alert('Error uploading Tunisian question audio file');
            return;
          }
        }
      }
    }
  }

  // Create form data - IMPORTANT: Add image first and separately
  const fd = new FormData();
  
  // Add image file - this must be a File object
  fd.append("image", storyData.image);
  
  // Add other data as JSON strings
  fd.append("title", JSON.stringify(storyData.title));
  fd.append("availableLanguages", JSON.stringify(storyData.availableLanguages));
  fd.append("stages", JSON.stringify(stagesData));

  // Debug: Check what's in FormData
  console.log('📤 FormData contents:');
  for (let [key, value] of fd.entries()) {
    if (key === 'image') {
      console.log(`- ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    } else {
      console.log(`- ${key}:`, value);
    }
  }

  try {
    const result = await axios.post(`/stories`, fd, {
      headers: { 
        "Content-Type": "multipart/form-data"
      },
      timeout: 60000
    });
    
    if (result.data.success) {
      setCurrentView('list');
      setSelectedStory(null);
      alert('✅ Story created successfully!');
    } else {
      alert('❌ Creation failed: ' + result.data.message);
    }
  } catch (error) {
    console.error('Create error:', error);
    let errorMessage = 'Failed to create story';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(`❌ ${errorMessage}`);
  }
};
  const handleEditStory = async (storyData) => {
  console.log('📦 Editing story with data:', storyData);

  let payload = {
    title: storyData.title,
    availableLanguages: storyData.availableLanguages,
    stages: storyData.stages
  };

  // Create form data
  const fd = new FormData();
  
  // Add image only if it's a new file
  if (storyData.image && storyData.image instanceof File) {
    console.log('📤 Uploading new image...');
    fd.append("image", storyData.image);
  }
  
  // Add other data as JSON strings
  fd.append("title", JSON.stringify(payload.title));
  fd.append("availableLanguages", JSON.stringify(payload.availableLanguages));
  fd.append("stages", JSON.stringify(payload.stages));

  // Debug: Check what's in FormData
  console.log('📤 FormData contents for update:');
  for (let [key, value] of fd.entries()) {
    if (key === 'image') {
      console.log(`- ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    } else {
      console.log(`- ${key}:`, value);
    }
  }

  try {
    // Use PUT request to the specific story ID
    const result = await axios.put(`/stories/${selectedStory._id}`, fd, {
      headers: { 
        "Content-Type": "multipart/form-data"
      },
      timeout: 60000
    });
    
    if (result.data.success) {
      setCurrentView('list');
      setSelectedStory(null);
      alert('✅ Story updated successfully!');
      // Refresh stories list
      fetchStories();
    } else {
      alert('❌ Update failed: ' + result.data.message);
    }
  } catch (error) {
    console.error('Update error:', error);
    let errorMessage = 'Failed to update story';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(`❌ ${errorMessage}`);
  }
};
  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      const result = await deleteStory(storyId);
      if (result.success) {
        alert('🗑️ Story deleted successfully!');
      } else {
        alert('❌ ' + result.error);
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedStory(null);
    setCurrentView('create');
    navigate('/admin/create');
  };

  const handleEdit = (story) => {
    setSelectedStory(story);
    setCurrentView('edit');
    navigate(`/admin/edit/${story._id}`);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedStory(null);
    navigate('/admin');
  };

  // New handler: show story details in a modal
  const handleViewDetails = (story) => {
    setSelectedStory(story);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    // keep selectedStory if you want, or clear it:
    // setSelectedStory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {currentView === 'list' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Stories</h2>
              <p className="text-gray-600">Manage your stories, questions, and audio content</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold flex items-center"
            >
              ➕ Create New Story
            </button>
          </div>
          <StoryList
            stories={stories}
            onEdit={handleEdit}
            onDelete={handleDeleteStory}
            onView={handleViewDetails}  
          />
        </div>
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <div>
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              ← Back to Stories
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {currentView === 'create' ? 'Create New Story' : `Edit: ${selectedStory?.title?.fr || selectedStory?.title || ''}`}
            </h2>
          </div>
          <StoryForm
            story={selectedStory}
            onSubmit={currentView === 'create' ? handleCreateStory : handleEditStory}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Story details modal */}
      {showDetails && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={closeDetails} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6 z-60">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Story details</h3>
              <button onClick={closeDetails} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>

            <div className="mb-4">
              <img src={selectedStory.image} alt="story" className="w-full max-h-64 object-cover rounded" />
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Title</h4>
              <div className="text-sm text-gray-700 break-words">
                {typeof selectedStory.title === "object" ? (selectedStory.title.fr || selectedStory.title.tn || JSON.stringify(selectedStory.title)) : selectedStory.title}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Stages</h4>
              {Array.isArray(selectedStory.stages) && selectedStory.stages.length > 0 ? (
                selectedStory.stages.map((stage, sIdx) => (
                  <div key={sIdx} className="mb-3 pl-2 border-l-2 border-gray-200">
                    <div className="text-sm font-medium text-gray-800">Stage {sIdx + 1}</div>
                    {Array.isArray(stage.segments) && stage.segments.map((seg, segIdx) => (
                      <div key={segIdx} className="mt-2 bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-700"><strong>Segment {segIdx + 1}</strong></div>
                        <div className="text-xs text-gray-600 mt-1">Audio: <a href={typeof seg.audio === 'string' ? seg.audio : (seg.audio?.fr || seg.audio?.tn)} target="_blank" rel="noreferrer" className="text-blue-600 underline">Play</a></div>
                        {seg.question && (
                          <div className="mt-2">
                            <div className="text-sm font-semibold">Question</div>
                            <div className="text-sm text-gray-700 break-words">{typeof seg.question.question === 'object' ? (seg.question.question.fr || seg.question.question.tn || JSON.stringify(seg.question.question)) : seg.question.question}</div>
                            <div className="mt-2">
                              <div className="text-xs font-medium">Answers:</div>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {(seg.question.answers || []).map((a, ai) => (
                                  <li key={ai}>{typeof a.text === 'object' ? (a.text.fr || a.text.tn || JSON.stringify(a.text)) : a.text} {a.correct ? <span className="text-green-600 font-semibold"> (correct)</span> : null}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Hint: {typeof seg.question.hint === 'object' ? (seg.question.hint.fr || seg.question.hint.tn || seg.question.hint) : seg.question.hint || "-"}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">No stages available</div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={closeDetails} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}