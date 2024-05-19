import OnlineUser from "../models/active";

export async function userOnline(
  userId: string,
  connectionId: string
): Promise<Error | undefined> {
  try {
    const online = await OnlineUser.findOne({ userId});
    if (!online) {
      const newOnline = new OnlineUser({
        userId: userId,
        connectionId: connectionId,
      });
      await newOnline.save();
    } else {
      online.connectionId = connectionId;
      await online.save();
    }
  } catch (error) {
    console.log("Errorin saving user online. Error:", error);
    const err = new Error("cant able to set user online");
    return err;
  }
}

export async function userOffline(userId: string): Promise<Error | undefined> {
  try {
    await OnlineUser.deleteMany({ userId });
  } catch (error) {
    console.log("Error in deleting user online. Error:", error);
    const err = new Error("cant able to set user offline");
    return err;
  }
}

export async function isUserOnline(
  userId: string
): Promise<string | undefined> {
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
