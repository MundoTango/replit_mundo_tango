const REQUEST_STATUS = {
  CONNECTED: "connected",
  PENDING: "pending",
  DECLINE: "decline",
};

const POST_CREATION_TYPE = {
  LOCATION: "Location",
  IMAGE: "Image",
  ACTIVITY: "Activity",
};

// "teacher_at": "1981-08-18T00:00:00.000Z",
// "dj_at": null,
// "photographer_at": null,
// "host_at": null,
// "organizer_at": "1976-10-22T00:00:00.000Z",
// "creator_at": null,
// "performer_at": null,
// "tour_operator_at": "1995-01-24T00:00:00.000Z",
// "social_dancer": null

const Activities = (record) => {
  const keys = [
    { title: "teacher_at", value: "Teacher" },
    { title: "dj_at", value: "DJ" },
    { title: "photographer_at", value: "Photographer" },
    { title: "host_at", value: "Host" },
    { title: "organizer_at", value: "Organizer" },
    { title: "creator_at", value: "Creator" },
    { title: "performer_at", value: "Performer" },
    { title: "tour_operator_at", value: "Tour Operator" },
    { title: "social_dancer", value: "Social Dancer" },
  ];

  const arr = [];
  for (let i = 0; i < keys.length; i++) {
    const { title, value } = keys[i];
    if (record[title]) {
      arr.push(value);
    }
  }

  return arr;
};

export { REQUEST_STATUS, POST_CREATION_TYPE, Activities };
