import Image from "next/image";
import { Avatar } from "primereact/avatar";
import { useEffect, useState } from "react";

interface AvatarPicProps {
    image: string | null | undefined;
    width: number;
    height: number;
}

export default function AvatarPic({ image, width, height }: AvatarPicProps) {
    const [img, setImg] = useState<string>(image ? image : "/images/Dog1.svg");
    //Refactor para lidar com a mudanca de estado da imagem
    useEffect(() => {
        if (image) setImg(image);
    }, [image]);
    return (
        <>
            <Avatar
                size="xlarge"
                shape="circle"
                style={{ width: width, height: height }}
            >
                <Image
                    src={img || ""}
                    alt="Avatar"
                    width={width}
                    height={height}
                    style={{ objectFit: "cover" }}
                    //Nao é boas praticas
                    onError={() => setImg("/images/Dog1.svg")}
                />
            </Avatar>
        </>
    );
}

