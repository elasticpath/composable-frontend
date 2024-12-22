import { OrderItem, OrderItemProps } from "./OrderItem";
import { formatIsoDateString } from "../../../../lib/format-iso-date-string";

export function OrderItemWithDetails(props: Omit<OrderItemProps, "children">) {
  const sortedOrderItems = props.orderItems.sort(
    (a, b) => b.unit_price.amount - a.unit_price.amount,
  );

  return (
    <OrderItem {...props}>
      <div className="flex flex-col gap-y-2.5">
        <ul className="text-sm">
          {sortedOrderItems.map((item) => (
            <li key={item.id}>
              {item.quantity} × {item.name}
            </li>
          ))}
        </ul>
        <div className="w-full border-t border-black/10" />
        <div className="flex flex-col">
          <span className="text-black/60 text-sm">Ordered</span>
          <time
            className="text-sm"
            dateTime={props.order.meta.timestamps.created_at}
          >
            {formatIsoDateString(props.order.meta.timestamps.created_at)}
          </time>
        </div>
      </div>
    </OrderItem>
  );
}
