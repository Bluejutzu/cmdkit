interface Response {
  id: string;
}

interface ProfileInt {
  id: string;
  name: string;
  properties: [
    {
      name: string;
      value: string;
    }
  ];
  profileActions?: string[];
  timeTaken?: number;
  textureDecoded?: string;
  avatar?: string;
  authCode?: string;
  token?: string;
  isVerified: boolean;
  discordAcc?: {
    name: string;
    id: string;
    profile?: string;
  };
}

interface User {
  id: string;
  uuid: string;
  createdAt: Date;
  discordName: string;
  minecraftName: string;
  token: string;
  code: string;
  avatar: string
}

export { ProfileInt, Response, User };
