import { z } from "zod";

export class schema {
  static emailType = z.enum(["VERIFY_EMAIL", "FORGOT_PASSWORD"]);
  static order = z.enum(["asc", "desc"]).optional();
  static pagination = z.object({ page: z.number().min(1), limit: z.number().min(1).optional() });
  static email = z.string().email("Please provide a valid email");
  static password = z.string().min(6);
  static forgotPassword = z.object({ email: this.email, token: z.string(), type: schema.emailType });
  static login = z.object({ email: this.email, password: this.password });
  static register = z.object({ email: this.email, password: this.password });

  static user = class {
    static sorting = z.array(
      z.object({
        title: z.string(),
        slug: z.string(),
        value: z.object({
          name: schema.order,
          email: schema.order,
          registeredAt: schema.order,
          updatedAt: schema.order,
          position: z.object({ name: schema.order }).optional(),
        }),
      })
    );

    static list = z.object({
      pagination: schema.pagination,
      sorting: this.sorting,
      params: z
        .object({
          id: z.string().optional(),
          email: z.string().optional(),
          name: z.string().optional(),
          followers: z.number().int().optional(),
          isActive: z.boolean().optional(),
          graduatedDate: z.string().optional(),
          positionId: z.string().optional(),
        })
        .optional(),
    });

    static create = z.object({
      name: z.string().min(4),
      email: schema.email,
      positionId: z.string().nullish(),
      graduatedDate: z.string(),
    });

    static detail = z.object({ id: z.string() });
    static update = z.object({ id: this.detail.shape.id, body: this.create });
  };

  static position = class {
    static list = z.object({ params: z.object({ search: z.string().optional() }) }).optional();
    static create = z.object({ name: z.string().min(1) });
    static detail = z.object({ id: z.string() });
    static update = z.object({ id: this.detail.shape.id, body: this.create });
  };
}

export type Pagination = z.infer<typeof schema.pagination>;
export type Login = z.infer<typeof schema.login>;
export type EmailType = z.infer<typeof schema.emailType>;
export type Register = z.infer<typeof schema.register>;
export type ForgotPassword = z.infer<typeof schema.forgotPassword>;
