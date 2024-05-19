import OnlineUser from "../models/active";

export async function userOnline(
  userId: string,
  connectionId: string
): Promise<Error | undefined> {
  const online = await OnlineUser.findOne({ userId, connectionId });
  if (!online) {
    try {
      const newOnline = new OnlineUser({
        userId: userId,
        connectionId: connectionId,
      });
      await newOnline.save();
    } catch (error) {
      console.log("Errorin saving user online. Error:", error);
      const err = new Error("cant able to set user online");
      return err;
    }
  }
}

export async function userOffline(
  userId: string,
  connectionId: string
): Promise<Error | undefined> {
  try {
    await OnlineUser.findOneAndDelete({ userId, connectionId });
    } catch (error) {
        console.log("Error in deleting user online. Error:", error);
        const err = new Error("cant able to set user offline");
        return err
    }
}

export async function isUserOnline(userId: string): Promise<string | undefined> {
  try {
    const online = await OnlineUser.findOne({ userId });
    if (online) {
        return online.connectionId;
    }
    return;
  } catch (error) {
    console.log("Error in checking user online. Error:", error);
    return;
  }
}