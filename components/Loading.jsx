import React from 'react';

const Loading = () => {
    return (
        <div className="loading-overlay" style={{ animation: 'none' }}> {/* Animation handled by mounting/unmounting or parent */}
            <div className="spinner"></div>
        </div>
    );
};

export default Loading;
