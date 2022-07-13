// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {DATA} from "../../constants/data"
type Data = {
  data: any;
  success: boolean;
  status: number;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ data: DATA.data, success: DATA.success, status: DATA.status })
}
