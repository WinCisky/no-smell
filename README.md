# DoAgain

## Storage

### eventTypes
```json
[
    [
        "Test",
        "#F44336"
    ]
]
```

### notifications-[TypeName]
```json
[
    {
        "id":"Test-18:0",
        "type":"Test",
        "time":"18:00"
    }
]
```

### events-[TypeName]
```json
[
    "2025-11-19",
    "2025-11-28",
    "2025-12-03"
]
```

### scheduled-[TypeName]
```json
[
    {
        "id":"Zxz6RbCUV3fxDSWI3GIr",
        "time":"2025-11-19T17:00:00.000Z",
        "type":"Test"
    },
    {
        "id":"z7eN0J4y1lTO5VOBTTeH",
        "time":"2025-11-28T17:00:00.000Z",
        "type":"Test"
    }
]
```

## TODO

- recalculate notifications for the year
    - [ ] on calendar if there is at least one notification time set schedule the notifications for the dates and the times
    - [ ] on notifications when adding a new hour for a type add missing notifications for already stored dates
    - [ ] on notifications when removing an hour for a type remove scheduled notifications for that hour for all stored dates
    - [ ] on home when removing an event for a date remove scheduled notifications for that date for the selected notification time
- [ ] fix size incoherence of bottom navigation bar for selected icon
- [ ] remove old events after notification is sent
- [ ] update notifications types in notification screen after adding a new type

---
- [ ] remove recurring notifications on notifications (callback on chip close icon)
- [ ] remove specific notification on home (callback on chip close icon)
- update notifications on:
    - [ ] save new type dates on calendar
    - [ ] delete type on calendar
    - [ ] save new notification time on notifications
    - [ ] delete time on notifications
- [ ] share stored notifications with other devices