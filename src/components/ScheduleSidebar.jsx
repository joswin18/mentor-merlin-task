import { FaSignOutAlt, FaChevronLeft, FaChevronRight, FaClock, FaInstagram, FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';

export function ScheduleSidebar({
    viewMonth,
    viewYear,
    monthFullNames,
    months,
    handlePrevMonth,
    handleNextMonth,
    setViewMonth,
    handleLogout,
    scheduleInfo,
    submitError,
    handleSubmit
}) {
    return (
        <div className="sidebar-section">
            <div className="sidebar-top">
                <div className="sidebar-title-row">
                    <h2 className="sidebar-title">Monthly Schedule</h2>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
                <div className="month-picker">
                    <button className="nav-btn" onClick={handlePrevMonth}><FaChevronLeft /></button>
                    <span className="month-year">{monthFullNames[viewMonth - 1]} {viewYear}</span>
                    <button className="nav-btn" onClick={handleNextMonth}><FaChevronRight /></button>
                </div>
            </div>

            <div className="sidebar-main-wrapper">
                <div className="sidebar-main-content">
                    <div className="time-slots">
                        <div className="time-slot-card">
                            <FaClock className="clock-icon" />
                            <div className="time-item">
                                <span className="time-value">09:00 hs</span>
                            </div>
                            <div className="time-divider"></div>
                            <div className="time-item">
                                <span className="time-value">06:00 hs</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-list-card">
                        {scheduleInfo.map((info, idx) => (
                            <div key={idx} className="info-item">
                                <span className="info-day">{info.day}</span>
                                <span className="info-topic">{info.topic}</span>
                            </div>
                        ))}
                    </div>

                    {submitError && (
                        <div style={{
                            color: '#dc3545',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#fff5f5',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            {submitError}
                        </div>
                    )}
                    <button className="submit-button" onClick={handleSubmit}>Submit</button>
                    <div className="sidebar-footer">
                        <div className="social-icons">
                            <FaInstagram />
                            <FaFacebookF />
                            <FaTwitter />
                            <FaWhatsapp />
                        </div>
                        <div className="inquiry">
                            For inquiry : +44 123456789
                        </div>
                    </div>
                </div>


                <div className="month-tab-sidebar">
                    {months.map((month, idx) => (
                        <div
                            key={month}
                            className={`month-tab ${(idx + 1) === viewMonth ? 'active' : ''}`}
                            onClick={() => setViewMonth(idx + 1)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') setViewMonth(idx + 1);
                            }}
                        >
                            {month}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
