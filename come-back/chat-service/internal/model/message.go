package model

import "encoding/json"

type ChatMessageType int

const (
	MessageType ChatMessageType = iota
	JoinType
	LeaveType
)

func (t ChatMessageType) String() string {
	switch t {
	case MessageType:
		return "message"
	case JoinType:
		return "join"
	case LeaveType:
		return "leave"
	default:
		return "unknown"
	}
}

func (t ChatMessageType) MarshalJSON() ([]byte, error) {
	return json.Marshal(t.String())
}

type ChatMessage struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	UserID    uint            `gorm:"not null;index" json:"userId"`
	Username  string          `gorm:"type:varchar(255)" json:"username,omitempty"`
	Content   string          `gorm:"type:text;not null" json:"content"`
	Timestamp int64           `gorm:"not null" json:"timestamp"`
	Type      ChatMessageType `gorm:"type:tinyint;default:0" json:"type"`
}
