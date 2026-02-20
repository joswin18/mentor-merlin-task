import { FaTimes } from 'react-icons/fa';

export function SelectedSlotsModal({
    isModalOpen,
    setIsModalOpen,
    modalSlots,
    handleDeleteFromModal,
    handleModalOk
}) {
    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-wrapper">
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                    <FaTimes />
                </button>
                <div className="modal-content">
                    <h2 className="modal-title">Selected Slots</h2>

                    <div className="modal-slots-container">
                        {modalSlots.map((slot) => (
                            <div key={slot.id} className="modal-slot-card">
                                <div className="modal-slot-header">{slot.title}</div>
                                <div className="modal-slot-body">
                                    <div className="modal-slot-date">{slot.date}</div>
                                    <div className="modal-slot-info">
                                        <span className="modal-slot-day">{slot.day}</span>
                                        <span className="modal-slot-topic">{slot.topic}</span>
                                    </div>
                                </div>
                                <button className="modal-slot-delete" onClick={() => handleDeleteFromModal(slot.id)}>Delete</button>
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="modal-ok-btn" onClick={handleModalOk}>Ok</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
