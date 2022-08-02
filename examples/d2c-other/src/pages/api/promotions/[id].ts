import type { Promotion, Resource } from "@moltin/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTPMethod, isSupportedMethod } from "../../../lib/request-helpers";
import { getPromotionById } from "../../../services/promotions";

const supportedMethods: HTTPMethod[] = ["GET"];

interface EpccResponseError {
  errors: { [key: string]: string | number }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resource<Promotion> | EpccResponseError>
): Promise<void> {
  if (!req.method || !isSupportedMethod(req.method, supportedMethods)) {
    res.status(405).send({
      errors: [
        {
          message: `Only ${supportedMethods} requests allowed`,
        },
      ],
    });
    return;
  }

  const promotionId = req.query.id as string;

  try {
    const promotionResp = await getPromotionById(promotionId);
    res.status(200).json(promotionResp);
  } catch (err: any) {
    res.status(500).json(err);
  }
  res.status(500);
}
