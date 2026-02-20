export function CalendarGrid({
    loading,
    error,
    refreshMonth,
    calendarDays,
    handleCellClick,
    viewYear,
    viewMonth
}) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar-section">
            <h1 className="main-title">Select your slots</h1>

            <div className="calendar-grid-container">
                <div className="calendar-header-row">
                    {daysOfWeek.map(day => (
                        <div key={day} className="weekday-label">{day}</div>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        Loading calendar...
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
                        Error: {error}
                        <br />
                        <button
                            onClick={refreshMonth}
                            style={{
                                marginTop: '10px',
                                padding: '8px 16px',
                                background: '#725a8a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : calendarDays.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No calendar data available
                    </div>
                ) : (
                    <div className="calendar-grid" key={`${viewYear}-${viewMonth}`}>
                        {calendarDays.map((item, idx) => (
                            <div
                                key={idx}
                                className={`calendar-cell ${item.type}`}
                                onClick={() => handleCellClick(item)}
                            >
                                {item.dayNum && (
                                    <div className="cell-top">
                                        <span className="cell-day-num">{item.dayNum}</span>
                                        <span className="cell-topic">{item.topic}</span>
                                    </div>
                                )}
                                <span className="cell-date">{item.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
