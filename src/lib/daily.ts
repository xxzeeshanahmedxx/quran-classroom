export async function createDailyRoom(apiKey: string, roomName: string, durationMinutes: number): Promise<string> {
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'public',
      properties: {
        max_participants: 4,
        exp: Math.floor(Date.now() / 1000) + durationMinutes * 60,
        enable_screenshare: true,
        eject_at_room_exp: true,
        enable_chat: true,
        enable_hand_raising: true,
        enable_emoji_reactions: true,
        enable_people_ui: true,
        enable_noise_cancellation_ui: true,
        start_audio_off: true,
        enable_prejoin_ui: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily.co API error: ${response.status} ${error}`);
  }

  const data = await response.json() as any;
  return data.url;
}

export async function createDailyToken(apiKey: string, roomName: string, userName: string, isOwner: boolean): Promise<string> {
  const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        is_owner: isOwner,
        start_audio_off: !isOwner,
        start_video_off: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily.co token error: ${response.status} ${error}`);
  }

  const data = await response.json() as any;
  return data.token;
}
