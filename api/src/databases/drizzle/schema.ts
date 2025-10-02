import * as UserSchema from "@/models/drizzle/user.model";
import * as ShipmentSchema from "@/models/drizzle/shipment.model";
import * as QuoteSchema from "@/models/drizzle/quote.model";

const schema = {
	...UserSchema,
	...ShipmentSchema,
	...QuoteSchema,
};

export default schema;
