import { ReactNode } from "react";

const Para = ({ children }: { children: ReactNode }) => {
  return <div className="text-justify mt-4">{children}</div>;
};

interface IBlurbProps {
  title: string;
}

const Blurb = ({ title }: IBlurbProps) => (
  <main className="max-w-7xl m-auto py-4 px-8">
    <h2 className="text-center text-3xl font-semibold">{title}</h2>
    <Para>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu
      lectus, pharetra nec velit in, vehicula suscipit tellus. Quisque id mollis
      magna. Cras nec lacinia ligula. Morbi aliquam tristique purus, nec dictum
      metus euismod at. Vestibulum mollis metus lobortis lectus sodales
      eleifend. Class aptent taciti sociosqu ad litora torquent per conubia
      nostra, per inceptos himenaeos. Vivamus eget elementum eros, et ultricies
      mi. Donec eget dolor imperdiet, gravida ante a, molestie tortor. Nullam
      viverra, orci gravida sollicitudin auctor, urna magna condimentum risus,
      vitae venenatis turpis mauris sed ligula. Fusce mattis, mauris ut eleifend
      ullamcorper, dui felis tincidunt libero, ut commodo arcu leo a ligula.
      Cras congue maximus magna, et porta nisl pulvinar in. Nam congue orci
      ornare scelerisque elementum. Quisque purus justo, molestie ut leo at,
      tristique pretium dui.
    </Para>

    <Para>
      Vestibulum imperdiet commodo egestas. Proin tincidunt leo non purus
      euismod dictum. Vivamus sagittis mauris dolor, quis egestas purus placerat
      eget. Mauris finibus scelerisque augue ut ultrices. Praesent vitae nulla
      lorem. Ut eget accumsan risus, sed fringilla orci. Nunc volutpat, odio vel
      ornare ullamcorper, massa mauris dapibus nunc, sed euismod lectus erat
      eget ligula. Duis fringilla elit vel eleifend luctus. Quisque non blandit
      magna. Vivamus pharetra, dolor sed molestie ultricies, tellus ex egestas
      lacus, in posuere risus diam non massa. Phasellus in justo in urna
      faucibus cursus.
    </Para>

    <Para>
      Nullam nibh nisi, lobortis at rhoncus ut, viverra at turpis. Mauris ac
      sollicitudin diam. Phasellus non orci massa. Donec tincidunt odio justo.
      Sed gravida leo turpis, vitae blandit sem pharetra sit amet. Vestibulum
      ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia
      curae; Orci varius natoque penatibus et magnis dis parturient montes,
      nascetur ridiculus mus.
    </Para>

    <Para>
      In in pulvinar turpis, vel pulvinar ipsum. Praesent vel commodo nisi, id
      maximus ex. Integer lorem augue, hendrerit et enim vel, eleifend blandit
      felis. Integer egestas risus purus, ac rhoncus orci faucibus ac.
      Pellentesque iaculis ligula a mauris aliquam, at ullamcorper est
      vestibulum. Proin maximus sagittis purus ac pretium. Ut accumsan vitae
      nisl sed viverra.
    </Para>

    <Para>
      Vivamus malesuada elit facilisis, fringilla lacus non, vulputate felis.
      Curabitur dignissim quis ipsum eget pellentesque. Duis efficitur nec nisl
      sit amet porta. Maecenas ac dui a felis finibus elementum feugiat at nibh.
      Donec convallis sodales neque. Integer id libero eget diam finibus
      tincidunt id id diam. Fusce ut lectus nisi. Donec orci enim, semper ac
      feugiat vitae, dignissim non enim. Vestibulum commodo dolor nec sem
      viverra gravida. Ut laoreet eu tortor auctor consequat. Nulla quis mauris
      mollis, aliquam mi nec, laoreet ligula. Fusce laoreet lorem et malesuada
      suscipit. Nullam convallis, risus a posuere ultrices, velit augue
      porttitor ante, vitae lobortis ligula velit id justo. Praesent nec lorem
      massa.
    </Para>
  </main>
);

export default Blurb;
