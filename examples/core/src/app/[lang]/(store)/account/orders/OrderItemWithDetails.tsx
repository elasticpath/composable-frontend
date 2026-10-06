import { OrderItem, OrderItemProps, sortOrderItems } from "./OrderItem";
import { formatIsoDateString } from "src/lib/format-iso-date-string";
import { paymentStatusLabel } from "src/lib/order-filter";

export function OrderItemWithDetails(props: Omit<OrderItemProps, "children">) {
  const sortedOrderItems = sortOrderItems(props.orderItems);
  const paymentStatus = paymentStatusLabel(props.order.payment);

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
        <dl className="flex flex-wrap gap-x-10 gap-y-2.5">
          <div className="flex flex-col">
            <dt className="text-black/60 text-sm">Ordered</dt>
            <dd>
              <time
                className="text-sm"
                dateTime={props.order.meta?.timestamps?.created_at}
              >
                {formatIsoDateString(props.order.meta?.timestamps?.created_at!)}
              </time>
            </dd>
          </div>
          {paymentStatus && (
            <div className="flex flex-col">
              <dt className="text-black/60 text-sm">Payment</dt>
              <dd className="text-sm">{paymentStatus}</dd>
            </div>
          )}
        </dl>
      </div>
    </OrderItem>
  );
}
