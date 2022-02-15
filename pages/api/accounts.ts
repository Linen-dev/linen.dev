import { NextApiRequest, NextApiResponse } from "next/types";
import { findOrCreateAccount } from "../../lib/slack";

//example param:
// {
//     "team_id": "T017CSH2R70",
//     "team_name": "Papercups"
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const teamId = req.body.team_id;
    const teamName = req.body.team_name;
    const account = await findOrCreateAccount({
      slackTeamId: teamId,
      name: teamName,
    });
    res.status(200).json(account);
    return;
  }
  res.status(200).json("ok");
}

const get = () => {};
