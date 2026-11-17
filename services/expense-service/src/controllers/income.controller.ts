import type { Request, Response } from "express";
import { z } from "zod";
import { createIncomeService, deleteIncomeService, getIncomeService, updateIncomeService } from "../services/income.services.js";



const createIncomeSchema = z.object({
  title: z.string().trim().min(1).max(150),
  amount: z.number().finite().positive(),
  category: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  incomeDate: z.iso.date().optional(),
  

});


const updateIncomeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  amount: z.number().finite().positive().optional(),
  description: z.string().max(2000).nullable().optional(),
})
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" }
  );  





export async function createIncome(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result = createIncomeSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid income data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const income = await createIncomeService({
      ...result.data,
      userId: req.auth.sub,
    });

    res.status(201).json({
      message: "Income created successfully",
      income,
    });
  } catch (error) {
    console.error("Create income error:", error);

    res.status(500).json({
      message: "Failed to create income",
    });
  }
}


export async function getIncome(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const userId = req.auth.sub;

    const incomes = await getIncomeService(userId);

    res.status(200).json({
      message: "Income fetched successfully",
      incomes,
    });
  } catch (error) {
    console.error("Get income error:", error);

    res.status(500).json({
      message: "Failed to fetch income",
    });
  }
}

export async function updateIncome(req: Request, res: Response): Promise<void> {

      if(!req.auth){
          res.status(401).json({
            message:"Authentication required"
          })
          return
      }
      const  parseId = z.uuid().safeParse(req.params.id);
      if(!parseId.success){
        res.status(400).json({
          message:"Invalid Income ID"
        })
        return
      }

      const id = parseId.data;

      const result = updateIncomeSchema.safeParse(req.body);

      if(!result.success){
        res.status(400).json({
          message:"Invalid Income Data",
          errors: result.error.issues
        })
        return
      }


      try {
        const userId = req.auth.sub;

        const incomes = await updateIncomeService(
          {
            id,
            userId,
            ...result.data
          }
        );

        if(!incomes){
          res.status(404).json({
            message:"Income Not Found"
          })
          return
        }

        res.status(200).json({
             message:"Income Updated Successfully",
              incomes
        })

        
      } catch (error) {
        console.log("Error while Updating income:", error)
        res.status(500).json({
          message:"Failed to Update Income"
        })
        
      }


}

export async function deleteIncome(req: Request, res: Response): Promise<void> {
  if(!req.auth){
    res.status(401).json({
      message:"Authentication required"
    })
    return
  }

  const parseId = z.uuid().safeParse(req.params.id);

  if(!parseId.success){
    res.status(400).json({
      message:"Invalid Income ID"
    })
    return
  }

  const id = parseId.data;

  try {
    const userId = req.auth.sub;

    const incomes = await deleteIncomeService(
      {
        id,
        userId
      }
    );

    if(!incomes){
      res.status(404).json({
        message:"Income Not Found"
      })
      return
    }

    res.status(200).json({
         message:"Income Deleted Successfully",
          incomes
    })

    
  } catch (error) {
    console.log("Error while Deleting income:", error)
    res.status(500).json({
      message:"Failed to Delete Income"
    })
  }
}