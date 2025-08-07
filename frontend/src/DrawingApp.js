import React, { useState, useRef, useEffect } from 'react';
import './DrawingApp.css';

const DrawingApp = () => {
    const [shapes, setShapes] = useState([]);
    const [paintingName, setPaintingName] = useState('My Painting');
    const [selectedColor, setSelectedColor] = useState('#ff6b6b');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [savedPaintings, setSavedPaintings] = useState([]);
    const [currentPaintingId, setCurrentPaintingId] = useState(null);
    const fileInputRef = useRef(null);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
    const API_BASE = 'http://localhost:5000/api';

    useEffect(() => {
        if (isLoggedIn && currentUser) {
            fetchSavedPaintings();
        }
    }, [isLoggedIn, currentUser]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                setIsLoggedIn(true);
                setCurrentUser(data.user);
                setLoginError('');
                setLoginData({ username: '', password: '' });
            } else {
                setLoginError(data.error);
            }
        } catch (error) {
            setLoginError('Connection error');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setShapes([]);
        setPaintingName('My Painting');
        setCurrentPaintingId(null);
        setSavedPaintings([]);
    };

    const fetchSavedPaintings = async () => {
        try {
            const response = await fetch(`${API_BASE}/paintings/${currentUser.id}`);
            const paintings = await response.json();
            setSavedPaintings(paintings);
        } catch (error) {
            console.error('Error fetching paintings:', error);
        }
    };

    const handleSave = async () => {
        if (!isLoggedIn || shapes.length === 0) return;

        try {
            const url = currentPaintingId
                ? `${API_BASE}/paintings/${currentUser.id}/${currentPaintingId}`
                : `${API_BASE}/paintings/${currentUser.id}`;

            const method = currentPaintingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: paintingName,
                    shapes: shapes
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                if (!currentPaintingId) {
                    setCurrentPaintingId(data.id);
                }
                fetchSavedPaintings();
            }
        } catch (error) {
            alert('Error saving painting');
        }
    };

    const handleLoad = async (paintingId) => {
        try {
            const response = await fetch(`${API_BASE}/paintings/${currentUser.id}/${paintingId}`);
            const painting = await response.json();

            setShapes(painting.shapes);
            setPaintingName(painting.name);
            setCurrentPaintingId(painting.id);
        } catch (error) {
            alert('Error loading painting');
        }
    };

    const handleDelete = async (paintingId) => {
        if (!window.confirm('Are you sure you want to delete this painting?')) return;

        try {
            const response = await fetch(`${API_BASE}/paintings/${currentUser.id}/${paintingId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Painting deleted successfully');
                if (currentPaintingId === paintingId) {
                    setShapes([]);
                    setPaintingName('My Painting');
                    setCurrentPaintingId(null);
                }
                fetchSavedPaintings();
            }
        } catch (error) {
            alert('Error deleting painting');
        }
    };

    const handleNewPainting = () => {
        setShapes([]);
        setPaintingName('My Painting');
        setCurrentPaintingId(null);
    };

    const handleDragStart = (e, shapeType) => {
        e.dataTransfer.setData('shapeType', shapeType);
        e.dataTransfer.setData('color', selectedColor);

        const dragElement = document.createElement('div');
        dragElement.className = `shape ${shapeType}`;
        dragElement.style.backgroundColor = selectedColor;
        dragElement.style.position = 'absolute';
        dragElement.style.top = '-1000px';
        dragElement.style.width = '50px';
        dragElement.style.height = '50px';

        if (shapeType === 'circle') {
            dragElement.style.borderRadius = '50%';
        } else if (shapeType === 'triangle') {
            dragElement.style.backgroundColor = 'transparent';
            dragElement.style.borderLeft = '25px solid transparent';
            dragElement.style.borderRight = '25px solid transparent';
            dragElement.style.borderBottom = `50px solid ${selectedColor}`;
            dragElement.style.width = '0';
            dragElement.style.height = '0';
        } else if (shapeType === 'trapezoid') {
            dragElement.style.backgroundColor = 'transparent';
            dragElement.style.borderLeft = '10px solid transparent';
            dragElement.style.borderRight = '10px solid transparent';
            dragElement.style.borderBottom = `50px solid ${selectedColor}`;
            dragElement.style.width = '30px';
            dragElement.style.height = '0';
        }

        document.body.appendChild(dragElement);
        e.dataTransfer.setDragImage(dragElement, 25, 25);

        setTimeout(() => {
            document.body.removeChild(dragElement);
        }, 0);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const shapeType = e.dataTransfer.getData('shapeType');
        const color = e.dataTransfer.getData('color');

        if (shapeType) {
            const canvasRect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - canvasRect.left - 25;
            const y = e.clientY - canvasRect.top - 25;

            const newShape = {
                id: Date.now(),
                type: shapeType,
                x: Math.max(0, Math.min(x, canvasRect.width - 50)),
                y: Math.max(0, Math.min(y, canvasRect.height - 50)),
                color: color
            };

            setShapes(prev => [...prev, newShape]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleShapeDoubleClick = (shapeId) => {
        setShapes(prev => prev.filter(shape => shape.id !== shapeId));
    };

    const renderShape = (shape) => {
        const baseStyle = {
            position: 'absolute',
            left: `${shape.x}px`,
            top: `${shape.y}px`,
            width: '50px',
            height: '50px',
            cursor: 'pointer',
        };

        switch (shape.type) {
            case 'square':
                return (
                    <div
                        key={shape.id}
                        style={{
                            ...baseStyle,
                            backgroundColor: shape.color,
                        }}
                        onDoubleClick={() => handleShapeDoubleClick(shape.id)}
                    />
                );

            case 'circle':
                return (
                    <div
                        key={shape.id}
                        style={{
                            ...baseStyle,
                            backgroundColor: shape.color,
                            borderRadius: '50%',
                        }}
                        onDoubleClick={() => handleShapeDoubleClick(shape.id)}
                    />
                );

            case 'triangle':
                return (
                    <div
                        key={shape.id}
                        style={{
                            ...baseStyle,
                            width: '0',
                            height: '0',
                            backgroundColor: 'transparent',
                            borderLeft: '25px solid transparent',
                            borderRight: '25px solid transparent',
                            borderBottom: `50px solid ${shape.color}`,
                        }}
                        onDoubleClick={() => handleShapeDoubleClick(shape.id)}
                    />
                );

            case 'trapezoid':
                return (
                    <div
                        key={shape.id}
                        style={{
                            ...baseStyle,
                            width: '30px',
                            height: '0',
                            backgroundColor: 'transparent',
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: `50px solid ${shape.color}`,
                        }}
                        onDoubleClick={() => handleShapeDoubleClick(shape.id)}
                    />
                );

            default:
                return null;
        }
    };

    const getShapeCounts = () => {
        const counts = { square: 0, circle: 0, triangle: 0, trapezoid: 0 };
        shapes.forEach(shape => {
            counts[shape.type]++;
        });
        return counts;
    };

    const handleExport = () => {
        const paintingData = {
            name: paintingName,
            shapes: shapes
        };

        const dataStr = JSON.stringify(paintingData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${paintingName.replace(/\s+/g, '_')}.json`;
        link.click();
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const paintingData = JSON.parse(e.target?.result);
                    if (paintingData.name && paintingData.shapes) {
                        setPaintingName(paintingData.name);
                        setShapes(paintingData.shapes);
                        setCurrentPaintingId(null);
                    }
                } catch (error) {
                    alert('Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    };

    const shapeCounts = getShapeCounts();

    // Login Screen
    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h1>Drawing App Login</h1>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                    </div>
                    {loginError && <div className="error">{loginError}</div>}
                    <button onClick={handleLogin} className="login-btn">Login</button>
                    <div className="demo-users">
                        <h3>Demo Users:</h3>
                        <p>user1 / password1</p>
                        <p>user2 / password2</p>
                        <p>user3 / password3</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="drawing-app">
            <header className="header">
                <div className="header-left">
                    <input
                        type="text"
                        value={paintingName}
                        onChange={(e) => setPaintingName(e.target.value)}
                        className="painting-name"
                    />
                    <div className="header-buttons">
                        <button onClick={handleNewPainting} className="btn new-btn">
                            New
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn save-btn"
                            disabled={shapes.length === 0}
                        >
                            Save
                        </button>
                        <button onClick={handleImport} className="btn import-btn">
                            Import
                        </button>
                        <button onClick={handleExport} className="btn export-btn">
                            Export
                        </button>
                    </div>
                </div>
                <div className="user-info">
                    <span>Welcome, {currentUser.username}!</span>
                    <button onClick={handleLogout} className="btn logout-btn">
                        Logout
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    style={{ display: 'none' }}
                />
            </header>

            <div className="main-content">
                <aside className="sidebar">
                    <h3>Shapes</h3>

                    <div className="color-selector">
                        <h4>Colors</h4>
                        <div className="color-options">
                            {colors.map(color => (
                                <div
                                    key={color}
                                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="shape-list">
                        <div
                            className="shape-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'square')}
                        >
                            <div className="shape square" style={{ backgroundColor: selectedColor }}></div>
                            <span>Square</span>
                        </div>

                        <div
                            className="shape-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'circle')}
                        >
                            <div className="shape circle" style={{ backgroundColor: selectedColor }}></div>
                            <span>Circle</span>
                        </div>

                        <div
                            className="shape-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'triangle')}
                        >
                            <div
                                className="shape triangle"
                                style={{
                                    borderBottomColor: selectedColor
                                }}
                            ></div>
                            <span>Triangle</span>
                        </div>

                        <div
                            className="shape-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'trapezoid')}
                        >
                            <div
                                className="shape trapezoid"
                                style={{
                                    borderBottomColor: selectedColor
                                }}
                            ></div>
                            <span>Trapezoid</span>
                        </div>
                    </div>

                    <div className="instructions">
                        <p>Double-click to delete shapes</p>
                    </div>

                    <div className="saved-paintings">
                        <h4>Saved Paintings ({savedPaintings.length})</h4>
                        <div className="paintings-list">
                            {savedPaintings.map(painting => (
                                <div key={painting.id} className="painting-item">
                                    <div className="painting-info">
                                        <span className="painting-title">{painting.name}</span>
                                        <span className="painting-date">
                                            {new Date(painting.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="painting-actions">
                                        <button
                                            onClick={() => handleLoad(painting.id)}
                                            className="btn-small load-btn"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(painting.id)}
                                            className="btn-small delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main
                    className="canvas"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {shapes.length === 0 && (
                        <div className="canvas-placeholder">
                            <p>Drag shapes here to start drawing</p>
                            <p className="hint">Double-click shapes to remove them</p>
                        </div>
                    )}
                    {shapes.map(renderShape)}
                </main>
            </div>

            <footer className="footer">
                <div className="shape-counts">
                    <div className="count-item">
                        <div className="shape-icon square-icon"></div>
                        <span>{shapeCounts.square} Squares</span>
                    </div>
                    <div className="count-item">
                        <div className="shape-icon circle-icon"></div>
                        <span>{shapeCounts.circle} Circles</span>
                    </div>
                    <div className="count-item">
                        <div className="shape-icon triangle-icon"></div>
                        <span>{shapeCounts.triangle} Triangles</span>
                    </div>
                    <div className="count-item">
                        <div className="shape-icon trapezoid-icon"></div>
                        <span>{shapeCounts.trapezoid} Trapezoids</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DrawingApp;
